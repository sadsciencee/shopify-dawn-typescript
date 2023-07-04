import { safeDefineElement } from '@/scripts/functions'

import { FacetFiltersForm, initializeFacetFiltersForm } from '@/scripts/catalog/facet-filters-form'
import { PriceRange } from '@/scripts/catalog/price-range'
import { FacetRemove } from '@/scripts/catalog/facet-remove'
import { MainSearch } from '@/scripts/catalog/main-search'

safeDefineElement(FacetFiltersForm, undefined, initializeFacetFiltersForm)
safeDefineElement(PriceRange)
safeDefineElement(FacetRemove)
safeDefineElement(MainSearch)

