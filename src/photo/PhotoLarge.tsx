import {
  Photo,
  shouldShowCameraDataForPhoto,
  shouldShowExifDataForPhoto,
  titleForPhoto,
} from '.';
import SiteGrid from '@/components/SiteGrid';
import ImageLarge from '@/components/ImageLarge';
import { clsx } from 'clsx/lite';
import Link from 'next/link';
import { pathForPhoto, pathForPhotoShare } from '@/site/paths';
import PhotoTags from '@/tag/PhotoTags';
import ShareButton from '@/components/ShareButton';
import PhotoCamera from '../camera/PhotoCamera';
import { cameraFromPhoto } from '@/camera';
import PhotoFilmSimulation from '@/simulation/PhotoFilmSimulation';
import { sortTags } from '@/tag';
import AdminPhotoMenu from '@/admin/AdminPhotoMenu';
import { Suspense } from 'react';

export default function PhotoLarge({
  photo,
  primaryTag,
  priority,
  prefetchShare,
  showCamera = true,
  showSimulation = true,
  shouldShareTag,
  shouldShareCamera,
  shouldShareSimulation,
  shouldScrollOnShare,
}: {
  photo: Photo
  primaryTag?: string
  priority?: boolean
  prefetchShare?: boolean
  showCamera?: boolean
  showSimulation?: boolean
  shouldShareTag?: boolean
  shouldShareCamera?: boolean
  shouldShareSimulation?: boolean
  shouldScrollOnShare?: boolean
}) {
  const tags = sortTags(photo.tags, primaryTag);

  const camera = cameraFromPhoto(photo);

  return (
    <SiteGrid
      contentMain={
        <ImageLarge
          className="w-full"
          alt={titleForPhoto(photo)}
          href={pathForPhoto(photo, primaryTag)}
          src={photo.url}
          aspectRatio={photo.aspectRatio}
          blurData={photo.blurData}
          priority={priority}
        />}
      contentSide={
        <div className={clsx(
          'leading-snug',
          'sticky top-4 self-start -translate-y-1',
          'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1',
          'gap-y-4',
          'pb-4',
        )}>
          {/* Meta */}
          <div className="row-span-3 sm:row-span-1">
            <div className="pr-2">
              <div className="relative flex gap-2 items-start">
                <div className="md:flex-grow">
                  <Link
                    href={pathForPhoto(photo)}
                    className="font-bold uppercase"
                  >
                    {titleForPhoto(photo)}
                  </Link>
                </div>
                <Suspense>
                  <div className="h-4 translate-y-[-3.5px] z-10">
                    <AdminPhotoMenu photo={photo} />
                  </div>
                </Suspense>
              </div>
              {photo.caption && <>
                <div className="text-medium uppercase pt-0.5">
                  {photo.caption}
                </div>
                {tags.length > 0 && <div className="text-medium">—</div>}
              </>}
              {tags.length > 0 &&
                <PhotoTags tags={tags} contrast="medium" />}
            </div>
          </div>
          {/* EXIF: Camera + Film Simulation */}
          <div>
            {showCamera && shouldShowCameraDataForPhoto(photo) &&
              <div className="space-y-0.5">
                <PhotoCamera
                  camera={camera}
                  type="text-only"
                />
                {showSimulation && photo.filmSimulation &&
                  <div className="translate-x-[-0.3rem]"> 
                    <PhotoFilmSimulation
                      simulation={photo.filmSimulation}
                    />
                  </div>}
              </div>}
          </div>
          {/* EXIF: Details */}
          <div>
            {shouldShowExifDataForPhoto(photo) &&
              <ul className="text-medium">
                <li>
                  {photo.focalLengthFormatted}
                  {photo.focalLengthIn35MmFormatFormatted &&
                    <>
                      {' '}
                      <span
                        title="35mm equivalent"
                        className="text-extra-dim"
                      >
                        {photo.focalLengthIn35MmFormatFormatted}
                      </span>
                    </>}
                </li>
                <li>{photo.fNumberFormatted}</li>
                <li>{photo.exposureTimeFormatted}</li>
                <li>{photo.isoFormatted}</li>
                <li>{photo.exposureCompensationFormatted ?? '—'}</li>
              </ul>}
          </div>
          {/* Date + Share */}
          <div>
            <div className={clsx(
              'flex gap-2',
              'md:flex-col md:gap-5',
            )}>
              <div className={clsx(
                'text-medium uppercase pr-1',
              )}>
                {photo.takenAtNaiveFormatted}
              </div>
              <ShareButton
                path={pathForPhotoShare(
                  photo,
                  shouldShareTag ? primaryTag : undefined,
                  shouldShareCamera ? camera : undefined,
                  shouldShareSimulation ? photo.filmSimulation : undefined,
                )}
                prefetch={prefetchShare}
                shouldScroll={shouldScrollOnShare}
              />
            </div>
          </div>
        </div>}
    />
  );
};
