'use client';

import LoaderButton from '@/components/primitives/LoaderButton';
import IconGrSync from '@/components/icons/IconGrSync';
import { useCallback, useEffect, useState } from 'react';
import {
  getOversizedBlurDataCountAction,
  regenerateOversizedBlurDataAction,
} from './actions';
import {
  BLUR_BACKFILL_BATCH_SIZE,
  BLUR_BACKFILL_MAX_RETRIES,
} from './update';

export default function SyncBlurButton() {
  const [photosRemaining, setPhotosRemaining] = useState<number>();
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    getOversizedBlurDataCountAction()
      .then(setPhotosRemaining)
      .catch(() => setPhotosRemaining(0));
  }, []);

  const regenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      let offset = 0;
      let remaining = photosRemaining ?? 0;
      // Every batch either slims photos or skips past ones it can't,
      // so this is only a backstop against an unforeseen stall. It
      // allows for a batch failing and being retried throughout.
      let batchesLeft =
        (Math.ceil(remaining / BLUR_BACKFILL_BATCH_SIZE) + 1) * 2;

      let retriesLeft = BLUR_BACKFILL_MAX_RETRIES;

      while (remaining > offset && batchesLeft > 0) {
        batchesLeft--;
        try {
          const result = await regenerateOversizedBlurDataAction(offset);
          // Photos which can't be slimmed stay in the set, so skip past
          // them rather than retrying them in every subsequent batch
          offset = result.skipOffset;
          remaining = result.remaining;
          retriesLeft = BLUR_BACKFILL_MAX_RETRIES;
        } catch (e) {
          // A batch which exceeds the route's duration limit still
          // commits the photos it got through, so pick up where it
          // left off instead of abandoning the rest. Only consecutive
          // failures, which suggest a stall rather than a slow batch,
          // give up.
          if (retriesLeft-- <= 0) { throw e; }
          remaining = await getOversizedBlurDataCountAction();
        }
        setPhotosRemaining(remaining);
      }
    } finally {
      setIsRegenerating(false);
    }
  }, [photosRemaining]);

  return !photosRemaining ? null : (
    <LoaderButton
      icon={<IconGrSync className="translate-y-[0.5px]" />}
      onClick={regenerate}
      isLoading={isRegenerating}
      tooltip={
        `Regenerate oversized blur data for ${photosRemaining} photo` +
        `${photosRemaining === 1 ? '' : 's'}`
      }
      confirmText={
        `Regenerate blur data for ${photosRemaining} photo` +
        `${photosRemaining === 1 ? '' : 's'}? ` +
        'Each photo is re-downloaded, so this may take a while.'
      }
    >
      {photosRemaining}
    </LoaderButton>
  );
}
