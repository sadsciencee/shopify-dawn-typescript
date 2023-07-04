import { safeDefineElement } from '@/scripts/functions'
import { ProductForm } from '@/scripts/product/product-form'
import { ProductInfo } from '@/scripts/product/product-info'
import { ProductModal } from '@/scripts/product/product-modal'
import { VariantSelects } from '@/scripts/product/variant-selects'
import { VariantRadios } from '@/scripts/product/variant-radios'
import { ProductRecommendations } from '@/scripts/product/product-recommendations'
import { MediaGallery } from '@/scripts/product/media-gallery';

safeDefineElement(ProductInfo)
safeDefineElement(ProductForm)
safeDefineElement(VariantSelects)
safeDefineElement(VariantRadios)
safeDefineElement(ProductModal)
safeDefineElement(MediaGallery)
safeDefineElement(ProductRecommendations)
