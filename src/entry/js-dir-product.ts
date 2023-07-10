import { safeDefineElement } from '@/scripts/core/global'
import { ProductForm } from '@/scripts/product/product-form'
import { ProductInfo } from '@/scripts/product/product-info'
import { ProductModal } from '@/scripts/product/product-modal'
import { MediaGallery } from '@/scripts/product/media-gallery'
import { VariantSelects } from '@/scripts/theme/variant-selects';
import { VariantRadios } from '@/scripts/theme/variant-radios';
import { ProductRecommendations } from '@/scripts/theme/product-recommendations';

safeDefineElement(ProductInfo)
safeDefineElement(ProductForm)
safeDefineElement(ProductModal)
safeDefineElement(MediaGallery)
safeDefineElement(VariantSelects)
safeDefineElement(VariantRadios)
safeDefineElement(ProductRecommendations)
