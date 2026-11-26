import { CategoryKey } from '../category';
import {
  CATEGORY_VISIBILITY,
  IS_BUILDING,
  STATICALLY_OPTIMIZED_PHOTO_CATEGORIES,
  STATICALLY_OPTIMIZED_PHOTO_CATEGORY_OG_IMAGES,
  STATICALLY_OPTIMIZED_PHOTO_OG_IMAGES,
  STATICALLY_OPTIMIZED_PHOTOS,
} from '@/app/config';
import { GENERATE_STATIC_PARAMS_LIMIT } from '@/db';
import { getAllPublicPhotoIds } from '@/photo/query';
import { depluralize, pluralize } from '@/utility/string';

type StaticOutput = 'page' | 'image';

// Returning an empty array (instead of undefined) keeps routes static:
// nothing is generated at build time, but each path is rendered on its
// first request and then served from cache until revalidated, rather
// than being rendered on every request
const generateOnDemand = async () => [];

const logStaticGenerationDetails = (count: number, content: string) => {
  if (count > 0) {
    const label = pluralize(count, content, undefined, 3);
    console.log(`>  Statically generating ${label} ...`);
  }
};

export const staticallyGeneratePhotosIfConfigured = (type: StaticOutput) => (
  (type === 'page' && STATICALLY_OPTIMIZED_PHOTOS) ||
  (type === 'image' && STATICALLY_OPTIMIZED_PHOTO_OG_IMAGES)
)
  ? async () => {
    const photoIds = await getAllPublicPhotoIds({
      limit: GENERATE_STATIC_PARAMS_LIMIT,
    })
      .catch(e => {
        console.error(`Error fetching static photo data: ${e}`);
        return [];
      });
    if (IS_BUILDING) {
      logStaticGenerationDetails(photoIds.length, `photo ${type}`);
    }
    return photoIds.map(photoId => ({ photoId }));
  }
  : generateOnDemand;

export const staticallyGenerateCategoryIfConfigured = <T, K>(
  key: CategoryKey,
  type: StaticOutput,
  getData: () => Promise<T[]>,
  formatData: (data: T[]) => K[],
): (() => Promise<K[]>) =>
  CATEGORY_VISIBILITY.includes(key) && (
    (type === 'page' && STATICALLY_OPTIMIZED_PHOTO_CATEGORIES) ||
    (type === 'image' && STATICALLY_OPTIMIZED_PHOTO_CATEGORY_OG_IMAGES)
  )
    ? async () => {
      const data = (await getData()
        .catch(e => {
          console.error(`Error fetching static ${key} data: ${e}`);
          return [];
        }))
        .slice(0, GENERATE_STATIC_PARAMS_LIMIT);
      if (IS_BUILDING) {
        logStaticGenerationDetails(
          data.length,
          `${depluralize(key)} ${type}`,
        );
      }
      return formatData(data);
    }
    : generateOnDemand;
