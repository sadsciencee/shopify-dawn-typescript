import { safeDefineElement } from '@/scripts/core/global'
import { DeferredMedia } from '@/scripts/theme/deferred-media'
import { DetailsDisclosure } from '@/scripts/theme/details-disclosure'
import { SliderComponent } from '@/scripts/theme/slider-component'
import { SlideshowComponent } from '@/scripts/theme/slideshow-component'
import { StickyHeader } from '@/scripts/theme/sticky-header'
import { UcoastVideo } from '@/scripts/core/ucoast-video';
safeDefineElement(UcoastVideo)
safeDefineElement(DeferredMedia)
safeDefineElement(SliderComponent)
safeDefineElement(SlideshowComponent)
safeDefineElement(StickyHeader)
safeDefineElement(DetailsDisclosure)
