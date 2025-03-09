import { TsDOM as q} from '@/scripts/core/TsDOM'

import { FacetFiltersForm, beforeFacetFiltersForm, afterFacetFiltersForm } from '@/scripts/catalog/facet-filters-form'
import { PriceRange } from '@/scripts/catalog/price-range'
import { FacetRemove } from '@/scripts/catalog/facet-remove'
import { MainSearch } from '@/scripts/catalog/main-search'
import { ShowMoreButton } from '@/scripts/catalog/show-more-button';

q.safeDefineElement(FacetFiltersForm, beforeFacetFiltersForm, afterFacetFiltersForm)
q.safeDefineElement(PriceRange)
q.safeDefineElement(FacetRemove)
q.safeDefineElement(MainSearch)
q.safeDefineElement(ShowMoreButton)
