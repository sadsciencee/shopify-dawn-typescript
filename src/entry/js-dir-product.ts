import { TsDOM as q} from '@/scripts/core/TsDOM'
import { ProductForm } from '@/scripts/product/product-form'
import { ProductInfo } from '@/scripts/product/product-info'
import { ProductModal } from '@/scripts/product/product-modal'
import { MediaGallery } from '@/scripts/product/media-gallery'
import { VariantSelects } from '@/scripts/theme/variant-selects';
import { VariantRadios } from '@/scripts/theme/variant-radios';
import { ProductRecommendations } from '@/scripts/theme/product-recommendations';

q.safeDefineElement(ProductInfo)
q.safeDefineElement(ProductForm)
q.safeDefineElement(ProductModal)
q.safeDefineElement(MediaGallery)
q.safeDefineElement(VariantSelects)
q.safeDefineElement(VariantRadios)
q.safeDefineElement(ProductRecommendations)
