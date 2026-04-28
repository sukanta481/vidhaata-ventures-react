import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Check, ChevronRight, FileImage, FileText, ImagePlus, Loader2, Save, UploadCloud, X } from 'lucide-react'
import { api } from '@/hooks/useApi'
import { parsePropertyDescription } from '@/lib/property-display'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

type PropertyGroup = 'residential' | 'commercial' | 'land_plot'
type ListingPurpose = 'sale' | 'rent' | 'pg'
type BuildingType = 'society' | 'standalone' | 'house_villa'
type SaveState = 'idle' | 'saving' | 'success' | 'error'

type FormState = {
  id: string
  action: string
  title: string
  propertyGroup: PropertyGroup
  listingPurpose: ListingPurpose
  specificType: string
  transactionType: 'new_property' | 'resale'
  buildingType: BuildingType
  projectSocietyName: string
  societyScale: 'small' | 'medium' | 'large'
  societyAmenities: string[]
  buildingName: string
  basicUtilities: string[]
  waterSource: 'municipal' | 'borewell' | 'both'
  plotArea: string
  plotAreaUnit: 'sqft' | 'sqm' | 'sqyd'
  privateGarden: boolean
  privateTerrace: boolean
  address: string
  city: string
  state: string
  pincode: string
  floorNumber: string
  totalFloors: string
  totalArea: string
  totalAreaUnit: 'sqft' | 'sqm' | 'sqyd' | 'acre'
  roadWidth: string
  plotLength: string
  plotWidth: string
  boundaryWallMade: boolean
  cornerPlot: boolean
  naApproved: boolean
  naType: string
  configuration: string
  bathrooms: string
  balconies: string
  washroomsType: 'private' | 'shared'
  commercialFurnishingStatus: 'bare_shell' | 'warm_shell' | 'fully_furnished'
  centralAc: boolean
  dgBackup: boolean
  cafeteriaPantry: boolean
  visitorParking: boolean
  builtUpArea: string
  builtUpAreaUnit: 'sqft' | 'sqm'
  carpetArea: string
  reraRegistered: boolean
  reraRegistrationNumber: string
  expectedPrice: string
  priceNegotiable: boolean
  constructionStatus: 'ready_to_move' | 'under_construction'
  expectedMonthlyRent: string
  securityDeposit: string
  tenantPreference: 'families' | 'bachelors' | 'company_lease'
  monthlyRentPerBed: string
  totalPrice: string
  preLeasedProperty: boolean
  currentTenantName: string
  monthlyRentReceived: string
  leaseExpiryDate: string
  monthlyRent: string
  lockInPeriod: string
  lockInPeriodUnit: 'months' | 'years'
  revenueShareModel: boolean
  furnishing: 'fully_furnished' | 'semi_furnished' | 'unfurnished'
  parking: 'open' | 'covered'
  specialFeatures: string[]
  description: string
  videoTourUrl: string
}

const PROPERTY_GROUP_OPTIONS: { value: PropertyGroup; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land_plot', label: 'Land/Plot' },
]

const LISTING_PURPOSE_OPTIONS: { value: ListingPurpose; label: string; disabledFor?: PropertyGroup[] }[] = [
  { value: 'sale', label: 'Sale' },
  { value: 'rent', label: 'Rent', disabledFor: ['land_plot'] },
  { value: 'pg', label: 'PG', disabledFor: ['commercial', 'land_plot'] },
]

const SPECIFIC_TYPE_OPTIONS: Record<PropertyGroup, string[]> = {
  residential: ['Apartment/Flat', 'Builder Floor', 'Independent House/Villa', 'Penthouse', 'Studio Apartment'],
  commercial: ['Office Space', 'Retail Shop/Showroom', 'Warehouse/Godown', 'Co-working Space', 'Institutional'],
  land_plot: ['Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Industrial Plot'],
}

const SOCIETY_AMENITY_OPTIONS = ['Clubhouse', 'Gym', 'Children Play Area', 'Swimming Pool', 'Security', 'Lift']
const BASIC_UTILITY_OPTIONS = ['Lift', 'Power Backup', 'Security Cabin', 'Waste Management', 'Fire Safety']
const SPECIAL_FEATURE_OPTIONS = ['Corner Unit', 'Vaastu Compliant', 'High Rental Yield', 'Natural Light', 'Pet Friendly', 'Near Transit']
const CONFIGURATION_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', '5+ BHK']
const AREA_UNITS = ['sqft', 'sqm', 'sqyd'] as const
const LAND_AREA_UNITS = ['sqft', 'sqm', 'sqyd', 'acre'] as const
const NA_TYPES = ['Residential NA', 'Commercial NA', 'Industrial NA']

const defaultFormState: FormState = {
  id: '',
  action: 'save',
  title: '',
  propertyGroup: 'residential',
  listingPurpose: 'sale',
  specificType: SPECIFIC_TYPE_OPTIONS.residential[0],
  transactionType: 'new_property',
  buildingType: 'society',
  projectSocietyName: '',
  societyScale: 'medium',
  societyAmenities: [],
  buildingName: '',
  basicUtilities: [],
  waterSource: 'municipal',
  plotArea: '',
  plotAreaUnit: 'sqft',
  privateGarden: false,
  privateTerrace: false,
  address: '',
  city: '',
  state: '',
  pincode: '',
  floorNumber: '',
  totalFloors: '',
  totalArea: '',
  totalAreaUnit: 'sqft',
  roadWidth: '',
  plotLength: '',
  plotWidth: '',
  boundaryWallMade: false,
  cornerPlot: false,
  naApproved: false,
  naType: '',
  configuration: '2 BHK',
  bathrooms: '',
  balconies: '',
  washroomsType: 'private',
  commercialFurnishingStatus: 'bare_shell',
  centralAc: false,
  dgBackup: false,
  cafeteriaPantry: false,
  visitorParking: false,
  builtUpArea: '',
  builtUpAreaUnit: 'sqft',
  carpetArea: '',
  reraRegistered: true,
  reraRegistrationNumber: '',
  expectedPrice: '',
  priceNegotiable: false,
  constructionStatus: 'ready_to_move',
  expectedMonthlyRent: '',
  securityDeposit: '',
  tenantPreference: 'families',
  monthlyRentPerBed: '',
  totalPrice: '',
  preLeasedProperty: false,
  currentTenantName: '',
  monthlyRentReceived: '',
  leaseExpiryDate: '',
  monthlyRent: '',
  lockInPeriod: '',
  lockInPeriodUnit: 'months',
  revenueShareModel: false,
  furnishing: 'semi_furnished',
  parking: 'covered',
  specialFeatures: [],
  description: '',
  videoTourUrl: '',
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-6 p-5 sm:p-6">{children}</CardContent>
      </Card>
    </section>
  )
}

function FieldGroup({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-800">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function ChoiceCardGroup({
  value,
  onValueChange,
  options,
  disabled,
  columns = 3,
}: {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string; disabled?: boolean }[]
  disabled?: boolean
  columns?: 2 | 3
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className={`grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}
      disabled={disabled}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
            value === option.value
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
              : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          } ${disabled || option.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <RadioGroupItem value={option.value} disabled={disabled || option.disabled} className="mt-1" />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  )
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${disabled ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-slate-200 bg-slate-50'}`}>
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

function ChipMultiSelect({
  options,
  selected,
  onToggle,
  disabled,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
              active
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {active ? <Check className="h-3.5 w-3.5" /> : null}
            {option}
          </button>
        )
      })}
    </div>
  )
}

function AppendIfPresent(formData: FormData, key: string, value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return
  }

  formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
}

function toggleArrayValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function mapPropertyType(form: FormState) {
  if (form.propertyGroup === 'commercial') return 'commercial'
  if (form.propertyGroup === 'land_plot') return 'land'
  if (form.specificType === 'Independent House/Villa' || form.buildingType === 'house_villa') return 'house'
  return 'apartment'
}

function mapPrice(form: FormState) {
  if (form.propertyGroup === 'residential' && form.listingPurpose === 'sale') return form.expectedPrice
  if (form.propertyGroup === 'residential' && form.listingPurpose === 'rent') return form.expectedMonthlyRent
  if (form.propertyGroup === 'residential' && form.listingPurpose === 'pg') return form.monthlyRentPerBed
  if (form.propertyGroup === 'commercial' && form.listingPurpose === 'sale') return form.totalPrice
  if (form.propertyGroup === 'commercial' && form.listingPurpose === 'rent') return form.monthlyRent
  if (form.propertyGroup === 'land_plot') return form.totalPrice
  return ''
}

function mapBedrooms(configuration: string) {
  if (!configuration) return 0
  return configuration.startsWith('5+') ? 5 : Number.parseInt(configuration, 10) || 0
}

function buildDescription(form: FormState, visibility: Record<string, boolean>) {
  const summary: string[] = []

  summary.push(`Property Group: ${form.propertyGroup.replace('_', ' ')}`)
  summary.push(`Listing Purpose: ${form.listingPurpose}`)
  summary.push(`Specific Type: ${form.specificType}`)

  if (visibility.showTransactionType) {
    summary.push(`Transaction Type: ${form.transactionType.replace('_', ' ')}`)
  }

  if (visibility.showBuildingType) {
    summary.push(`Building Type: ${form.buildingType.replace('_', ' ')}`)
  }

  if (visibility.showResidentialDimensions) {
    summary.push(`Configuration: ${form.configuration}`)
    summary.push(`Bathrooms: ${form.bathrooms || '0'}`)
    summary.push(`Balconies: ${form.balconies || '0'}`)
  }

  if (visibility.showCommercialDimensions) {
    summary.push(`Washrooms: ${form.washroomsType}`)
    summary.push(`Commercial Furnishing: ${form.commercialFurnishingStatus.replaceAll('_', ' ')}`)
  }

  if (visibility.showLandFields) {
    summary.push(`Plot Size: ${form.totalArea || '-'} ${form.totalAreaUnit}`)
    summary.push(`Road Width: ${form.roadWidth || '-'}`)
    summary.push(`NA Approved: ${form.naApproved ? 'Yes' : 'No'}`)
    if (form.naApproved && form.naType) {
      summary.push(`NA Type: ${form.naType}`)
    }
  }

  if (visibility.showConstructionStatus) {
    summary.push(`Construction Status: ${form.constructionStatus.replaceAll('_', ' ')}`)
  }

  if (form.videoTourUrl) {
    summary.push(`Video Tour: ${form.videoTourUrl}`)
  }

  const intro = form.description.trim() || 'Property added from CRM admin panel.'
  return `${intro}\n\n${summary.join('\n')}`
}

export default function CrmPropertyCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [floorPlanFiles, setFloorPlanFiles] = useState<File[]>([])
  const [reraCertificateFiles, setReraCertificateFiles] = useState<File[]>([])
  const [isDraggingGallery, setIsDraggingGallery] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveMessage, setSaveMessage] = useState('Ready to save this listing.')
  const [lastSavedAt, setLastSavedAt] = useState<string>('')
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const floorPlanInputRef = useRef<HTMLInputElement | null>(null)
  const reraInputRef = useRef<HTMLInputElement | null>(null)

  const specificTypeOptions = useMemo(() => SPECIFIC_TYPE_OPTIONS[form.propertyGroup], [form.propertyGroup])

  useEffect(() => {
    setGalleryPreviews((current) => {
      current.forEach((url) => URL.revokeObjectURL(url))
      return galleryFiles.map((file) => URL.createObjectURL(file))
    })
  }, [galleryFiles])

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [galleryPreviews])

  useEffect(() => {
    if (!specificTypeOptions.includes(form.specificType)) {
      setForm((current) => ({ ...current, specificType: specificTypeOptions[0] }))
    }
  }, [form.specificType, specificTypeOptions])

  useEffect(() => {
    if (form.propertyGroup === 'land_plot' && form.listingPurpose !== 'sale') {
      setForm((current) => ({ ...current, listingPurpose: 'sale' }))
    }
    if (form.propertyGroup === 'commercial' && form.listingPurpose === 'pg') {
      setForm((current) => ({ ...current, listingPurpose: 'sale' }))
    }
  }, [form.propertyGroup, form.listingPurpose])

  useEffect(() => {
    if (isEditMode && id) {
      setSaveMessage('Loading property details...')
      api.getProperty(Number(id)).then(property => {
        const { rawDescription, metadata } = parsePropertyDescription(property.description || '')
        
        const pg = (metadata['property group']?.toLowerCase().replace(' ', '_') as PropertyGroup) || 
                   (property.property_type === 'commercial' ? 'commercial' : property.property_type === 'land' ? 'land_plot' : 'residential')
                   
        const newForm: FormState = {
          ...defaultFormState,
          id: String(property.id),
          action: 'update',
          title: property.title,
          propertyGroup: pg,
          listingPurpose: (metadata['listing purpose']?.toLowerCase() as ListingPurpose) || (property.status === 'for_sale' ? 'sale' : 'rent'),
          specificType: metadata['specific type'] || SPECIFIC_TYPE_OPTIONS[pg]?.[0] || 'Apartment/Flat',
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          pincode: property.zip_code || '',
          description: rawDescription,
          bathrooms: property.bathrooms ? String(property.bathrooms) : '',
          builtUpArea: property.square_feet ? String(property.square_feet) : '',
          totalArea: property.square_feet ? String(property.square_feet) : '',
          expectedPrice: property.price ? String(property.price) : '',
          totalPrice: property.price ? String(property.price) : '',
          expectedMonthlyRent: property.price ? String(property.price) : '',
          monthlyRent: property.price ? String(property.price) : '',
          transactionType: (metadata['transaction type']?.toLowerCase().replace(' ', '_') as 'new_property'|'resale') || 'new_property',
          buildingType: (metadata['building type']?.toLowerCase().replace(' ', '_') as BuildingType) || 'society',
          configuration: metadata['configuration'] || (property.bedrooms ? `${property.bedrooms} BHK` : '2 BHK'),
          constructionStatus: (metadata['construction status']?.toLowerCase().replace(' ', '_') as 'ready_to_move'|'under_construction') || 'ready_to_move',
          videoTourUrl: metadata['video tour'] || '',
          specialFeatures: property.amenities || []
        }
        
        if (property.featured_image) {
          const imgs = [property.featured_image]
          if (property.images && Array.isArray(property.images)) {
             property.images.forEach((img: string) => { if (img !== property.featured_image) imgs.push(img) })
          }
          setGalleryPreviews(imgs)
        }
        
        setForm(newForm)
        setSaveMessage('Ready to update this listing.')
      }).catch(err => {
        toast.error('Failed to load property details')
        navigate('/crm/listings')
      })
    }
  }, [id, isEditMode, navigate])

  const visibility = useMemo(() => {
    const isResidential = form.propertyGroup === 'residential'
    const isCommercial = form.propertyGroup === 'commercial'
    const isLand = form.propertyGroup === 'land_plot'
    const isSale = form.listingPurpose === 'sale'
    const isRent = form.listingPurpose === 'rent'
    const isPg = form.listingPurpose === 'pg'

    return {
      isResidential,
      isCommercial,
      isLand,
      isSale,
      isRent,
      isPg,
      showTransactionType: isSale && (isResidential || isCommercial),
      showBuildingType: isResidential,
      showSocietyFields: isResidential && form.buildingType === 'society',
      showStandaloneFields: isResidential && form.buildingType === 'standalone',
      showHouseVillaFields: isResidential && form.buildingType === 'house_villa',
      showFloorDetails: !isLand,
      showLandFields: isLand,
      showResidentialDimensions: isResidential,
      showCommercialDimensions: isCommercial,
      showCarpetArea: !isLand,
      showReraFields: form.reraRegistered,
      showConstructionStatus: isSale,
      showResidentialSaleFinancials: isResidential && isSale,
      showResidentialRentFinancials: isResidential && isRent,
      showResidentialPgFinancials: isResidential && isPg,
      showCommercialSaleFinancials: isCommercial && isSale,
      showCommercialRentFinancials: isCommercial && isRent,
      showLandSaleFinancials: isLand && isSale,
      showPreLeasedFields: isCommercial && isSale && form.preLeasedProperty,
    }
  }, [form])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleGallerySelection = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setGalleryFiles((current) => [...current, ...Array.from(files)])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingGallery(false)
    handleGallerySelection(event.dataTransfer.files)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.title.trim()) {
      toast.error('Property title is required.')
      setSaveState('error')
      setSaveMessage('Property title is required before saving.')
      return
    }

    const multipart = new FormData()
    multipart.append('id', form.id)
    multipart.append('action', form.action)
    multipart.append('title', form.title.trim())
    multipart.append('propertyGroup', form.propertyGroup)
    multipart.append('listingPurpose', form.listingPurpose)
    multipart.append('specificType', form.specificType)
    multipart.append('propertyType', mapPropertyType(form))
    multipart.append('status', form.listingPurpose === 'sale' ? 'for_sale' : 'for_rent')
    multipart.append('description', buildDescription(form, visibility))
    multipart.append('address', form.address)
    multipart.append('city', form.city)
    multipart.append('state', form.state)
    multipart.append('zipCode', form.pincode)
    multipart.append('country', 'India')
    multipart.append('price', mapPrice(form))
    multipart.append('bedrooms', visibility.showResidentialDimensions ? String(mapBedrooms(form.configuration)) : '0')
    multipart.append('bathrooms', form.bathrooms || '0')
    multipart.append('squareFeet', visibility.showLandFields ? form.totalArea : form.builtUpArea)
    multipart.append('isPublished', '1')
    multipart.append('isFeatured', '0')

    if (visibility.showTransactionType) multipart.append('transactionType', form.transactionType)
    if (visibility.showBuildingType) multipart.append('buildingType', form.buildingType)
    if (visibility.showSocietyFields) {
      AppendIfPresent(multipart, 'projectSocietyName', form.projectSocietyName)
      AppendIfPresent(multipart, 'societyScale', form.societyScale)
      multipart.append('societyAmenities', JSON.stringify(form.societyAmenities))
    }
    if (visibility.showStandaloneFields) {
      AppendIfPresent(multipart, 'buildingName', form.buildingName)
      AppendIfPresent(multipart, 'waterSource', form.waterSource)
      multipart.append('basicUtilities', JSON.stringify(form.basicUtilities))
    }
    if (visibility.showHouseVillaFields) {
      AppendIfPresent(multipart, 'plotArea', form.plotArea)
      AppendIfPresent(multipart, 'plotAreaUnit', form.plotAreaUnit)
      multipart.append('privateGarden', form.privateGarden ? '1' : '0')
      multipart.append('privateTerrace', form.privateTerrace ? '1' : '0')
    }
    if (visibility.showFloorDetails) {
      AppendIfPresent(multipart, 'floorNumber', form.floorNumber)
      AppendIfPresent(multipart, 'totalFloors', form.totalFloors)
    }
    if (visibility.showLandFields) {
      AppendIfPresent(multipart, 'totalArea', form.totalArea)
      AppendIfPresent(multipart, 'totalAreaUnit', form.totalAreaUnit)
      AppendIfPresent(multipart, 'roadWidth', form.roadWidth)
      AppendIfPresent(multipart, 'plotLength', form.plotLength)
      AppendIfPresent(multipart, 'plotWidth', form.plotWidth)
      multipart.append('boundaryWallMade', form.boundaryWallMade ? '1' : '0')
      multipart.append('cornerPlot', form.cornerPlot ? '1' : '0')
      multipart.append('naApproved', form.naApproved ? '1' : '0')
      if (form.naApproved) AppendIfPresent(multipart, 'naType', form.naType)
    }
    if (visibility.showResidentialDimensions) {
      AppendIfPresent(multipart, 'configuration', form.configuration)
      AppendIfPresent(multipart, 'balconies', form.balconies)
    }
    if (visibility.showCommercialDimensions) {
      AppendIfPresent(multipart, 'washroomsType', form.washroomsType)
      AppendIfPresent(multipart, 'commercialFurnishingStatus', form.commercialFurnishingStatus)
      multipart.append('centralAc', form.centralAc ? '1' : '0')
      multipart.append('dgBackup', form.dgBackup ? '1' : '0')
      multipart.append('cafeteriaPantry', form.cafeteriaPantry ? '1' : '0')
      multipart.append('visitorParking', form.visitorParking ? '1' : '0')
    }
    AppendIfPresent(multipart, 'builtUpAreaUnit', form.builtUpAreaUnit)
    if (visibility.showCarpetArea) AppendIfPresent(multipart, 'carpetArea', form.carpetArea)
    multipart.append('reraRegistered', form.reraRegistered ? '1' : '0')
    if (form.reraRegistered) {
      AppendIfPresent(multipart, 'reraRegistrationNumber', form.reraRegistrationNumber)
    }

    if (visibility.showResidentialSaleFinancials) {
      multipart.append('expectedPrice', form.expectedPrice)
      multipart.append('priceNegotiable', form.priceNegotiable ? '1' : '0')
    }
    if (visibility.showResidentialRentFinancials) {
      multipart.append('expectedMonthlyRent', form.expectedMonthlyRent)
      multipart.append('securityDeposit', form.securityDeposit)
      multipart.append('tenantPreference', form.tenantPreference)
    }
    if (visibility.showResidentialPgFinancials) {
      multipart.append('monthlyRentPerBed', form.monthlyRentPerBed)
      multipart.append('securityDeposit', form.securityDeposit)
    }
    if (visibility.showCommercialSaleFinancials) {
      multipart.append('totalPrice', form.totalPrice)
      multipart.append('priceNegotiable', form.priceNegotiable ? '1' : '0')
      multipart.append('preLeasedProperty', form.preLeasedProperty ? '1' : '0')
      if (visibility.showPreLeasedFields) {
        AppendIfPresent(multipart, 'currentTenantName', form.currentTenantName)
        AppendIfPresent(multipart, 'monthlyRentReceived', form.monthlyRentReceived)
        AppendIfPresent(multipart, 'leaseExpiryDate', form.leaseExpiryDate)
      }
    }
    if (visibility.showCommercialRentFinancials) {
      multipart.append('monthlyRent', form.monthlyRent)
      multipart.append('securityDeposit', form.securityDeposit)
      AppendIfPresent(multipart, 'lockInPeriod', form.lockInPeriod)
      AppendIfPresent(multipart, 'lockInPeriodUnit', form.lockInPeriodUnit)
      multipart.append('revenueShareModel', form.revenueShareModel ? '1' : '0')
    }
    if (visibility.showLandSaleFinancials) {
      multipart.append('totalPrice', form.totalPrice)
      multipart.append('priceNegotiable', form.priceNegotiable ? '1' : '0')
    }
    if (visibility.showConstructionStatus) multipart.append('constructionStatus', form.constructionStatus)

    multipart.append('furnishing', form.furnishing)
    multipart.append('parking', form.parking)
    multipart.append('videoTourUrl', form.videoTourUrl)
    multipart.append('specialFeatures', JSON.stringify(form.specialFeatures))

    const amenities = [
      ...form.specialFeatures,
      ...form.societyAmenities,
      ...form.basicUtilities,
      ...(form.centralAc ? ['Central AC'] : []),
      ...(form.dgBackup ? ['DG Backup'] : []),
      ...(form.cafeteriaPantry ? ['Cafeteria / Pantry'] : []),
      ...(form.visitorParking ? ['Visitor Parking'] : []),
      ...(form.privateGarden ? ['Private Garden'] : []),
      ...(form.privateTerrace ? ['Private Terrace'] : []),
      ...(form.boundaryWallMade ? ['Boundary Wall'] : []),
      ...(form.cornerPlot ? ['Corner Plot'] : []),
    ]
    multipart.append('amenities', JSON.stringify(Array.from(new Set(amenities))))

    galleryFiles.forEach((file) => multipart.append('gallery[]', file, file.name))
    floorPlanFiles.forEach((file) => multipart.append('floorPlans[]', file, file.name))
    if (form.reraRegistered) {
      reraCertificateFiles.forEach((file) => multipart.append('reraCertificate[]', file, file.name))
    }

    setSaveState('saving')
    setSaveMessage(isEditMode ? 'Updating property and attachments...' : 'Saving property and uploading attachments...')

    try {
      if (isEditMode && form.id) {
        await api.updateProperty(Number(form.id), multipart)
      } else {
        await api.createProperty(multipart)
      }
      const timestamp = new Date().toLocaleString()
      setSaveState('success')
      setSaveMessage(isEditMode ? 'Property updated successfully.' : 'Property saved successfully.')
      setLastSavedAt(timestamp)
      toast.success(isEditMode ? 'Property updated successfully.' : 'Property created successfully.')
      navigate('/crm/listings')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save property.'
      setSaveState('error')
      setSaveMessage(message)
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link to="/crm/listings" className="inline-flex items-center gap-2 font-medium text-slate-600 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{isEditMode ? 'Edit property' : 'Add property'}</span>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{isEditMode ? 'Edit Property' : 'Add Property'}</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Create a polished listing entry with the classification, compliance, pricing, and media details your team needs to publish confidently.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Property title is required. Hidden sections stay out of the submit payload automatically.
          </div>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={form.id} />
        <input type="hidden" name="action" value={form.action} />

        <SectionBlock
          title="Classification"
          description="Set the listing foundation: group, purpose, subtype, and the residential structure details that control downstream sections."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FieldGroup label="Property Title">
              <Input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Eg. Crestwood Heights 3 BHK" required />
            </FieldGroup>
            <FieldGroup label="Property Group">
              <Select value={form.propertyGroup} onValueChange={(value) => setField('propertyGroup', value as PropertyGroup)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_GROUP_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup label="Listing Purpose">
            <ChoiceCardGroup
              value={form.listingPurpose}
              onValueChange={(value) => setField('listingPurpose', value as ListingPurpose)}
              options={LISTING_PURPOSE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
                disabled: option.disabledFor?.includes(form.propertyGroup),
              }))}
            />
          </FieldGroup>

          <div className="grid gap-5 md:grid-cols-2">
            <FieldGroup label="Specific Type">
              <Select value={form.specificType} onValueChange={(value) => setField('specificType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {specificTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            {visibility.showTransactionType ? (
              <FieldGroup label="Transaction Type">
                <ChoiceCardGroup
                  value={form.transactionType}
                  onValueChange={(value) => setField('transactionType', value as FormState['transactionType'])}
                  options={[
                    { value: 'new_property', label: 'New Property' },
                    { value: 'resale', label: 'Resale' },
                  ]}
                  columns={2}
                />
              </FieldGroup>
            ) : null}
          </div>

          {visibility.showBuildingType ? (
            <>
              <FieldGroup label="Building Type">
                <ChoiceCardGroup
                  value={form.buildingType}
                  onValueChange={(value) => setField('buildingType', value as BuildingType)}
                  options={[
                    { value: 'society', label: 'Gated Complex / Society' },
                    { value: 'standalone', label: 'Standalone Building' },
                    { value: 'house_villa', label: 'Independent House / Villa' },
                  ]}
                />
              </FieldGroup>

              {visibility.showSocietyFields ? (
                <div className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                  <FieldGroup label="Project / Society Name">
                    <Input value={form.projectSocietyName} onChange={(event) => setField('projectSocietyName', event.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Society Scale">
                    <ChoiceCardGroup
                      value={form.societyScale}
                      onValueChange={(value) => setField('societyScale', value as FormState['societyScale'])}
                      options={[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                      ]}
                      columns={3}
                    />
                  </FieldGroup>
                  <div className="md:col-span-2">
                    <FieldGroup label="Society Amenities">
                      <ChipMultiSelect
                        options={SOCIETY_AMENITY_OPTIONS}
                        selected={form.societyAmenities}
                        onToggle={(value) => setField('societyAmenities', toggleArrayValue(form.societyAmenities, value))}
                      />
                    </FieldGroup>
                  </div>
                </div>
              ) : null}

              {visibility.showStandaloneFields ? (
                <div className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                  <FieldGroup label="Building Name">
                    <Input value={form.buildingName} onChange={(event) => setField('buildingName', event.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Water Source">
                    <Select value={form.waterSource} onValueChange={(value) => setField('waterSource', value as FormState['waterSource'])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="municipal">Municipal</SelectItem>
                        <SelectItem value="borewell">Borewell</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <div className="md:col-span-2">
                    <FieldGroup label="Basic Utilities">
                      <ChipMultiSelect
                        options={BASIC_UTILITY_OPTIONS}
                        selected={form.basicUtilities}
                        onToggle={(value) => setField('basicUtilities', toggleArrayValue(form.basicUtilities, value))}
                      />
                    </FieldGroup>
                  </div>
                </div>
              ) : null}

              {visibility.showHouseVillaFields ? (
                <div className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                  <FieldGroup label="Plot Area">
                    <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                      <Input type="number" value={form.plotArea} onChange={(event) => setField('plotArea', event.target.value)} />
                      <Select value={form.plotAreaUnit} onValueChange={(value) => setField('plotAreaUnit', value as FormState['plotAreaUnit'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {AREA_UNITS.map((unit) => <SelectItem key={unit} value={unit}>{unit.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </FieldGroup>
                  <div className="grid gap-3">
                    <ToggleRow label="Private Garden" checked={form.privateGarden} onCheckedChange={(checked) => setField('privateGarden', checked)} />
                    <ToggleRow label="Private Terrace" checked={form.privateTerrace} onCheckedChange={(checked) => setField('privateTerrace', checked)} />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </SectionBlock>

        <SectionBlock
          title="Location"
          description="Capture the address context and the physical placement details that determine how the property is discovered and understood."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldGroup label="Full Address / Landmark">
                <Input value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Street, locality, nearby landmark" />
              </FieldGroup>
            </div>
            <FieldGroup label="City">
              <Input value={form.city} onChange={(event) => setField('city', event.target.value)} />
            </FieldGroup>
            <FieldGroup label="State">
              <Input value={form.state} onChange={(event) => setField('state', event.target.value)} />
            </FieldGroup>
            <FieldGroup label="Pincode">
              <Input value={form.pincode} onChange={(event) => setField('pincode', event.target.value)} />
            </FieldGroup>
          </div>

          {visibility.showFloorDetails ? (
            <div className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <FieldGroup label="Floor Number">
                <Input type="number" value={form.floorNumber} onChange={(event) => setField('floorNumber', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Total Floors">
                <Input type="number" value={form.totalFloors} onChange={(event) => setField('totalFloors', event.target.value)} />
              </FieldGroup>
            </div>
          ) : null}

          {visibility.showLandFields ? (
            <div className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <FieldGroup label="Total Area">
                <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                  <Input type="number" value={form.totalArea} onChange={(event) => setField('totalArea', event.target.value)} />
                  <Select value={form.totalAreaUnit} onValueChange={(value) => setField('totalAreaUnit', value as FormState['totalAreaUnit'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LAND_AREA_UNITS.map((unit) => <SelectItem key={unit} value={unit}>{unit.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </FieldGroup>
              <FieldGroup label="Road Width">
                <Input type="number" value={form.roadWidth} onChange={(event) => setField('roadWidth', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Plot Length">
                <Input type="number" value={form.plotLength} onChange={(event) => setField('plotLength', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Plot Width">
                <Input type="number" value={form.plotWidth} onChange={(event) => setField('plotWidth', event.target.value)} />
              </FieldGroup>
              <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                <ToggleRow label="Boundary Wall Made" checked={form.boundaryWallMade} onCheckedChange={(checked) => setField('boundaryWallMade', checked)} />
                <ToggleRow label="Corner Plot" checked={form.cornerPlot} onCheckedChange={(checked) => setField('cornerPlot', checked)} />
                <ToggleRow label="NA Approved" checked={form.naApproved} onCheckedChange={(checked) => setField('naApproved', checked)} />
                <FieldGroup label="NA Type">
                  <Select
                    value={form.naType || 'not_selected'}
                    onValueChange={(value) => setField('naType', value === 'not_selected' ? '' : value)}
                    disabled={!form.naApproved}
                  >
                    <SelectTrigger><SelectValue placeholder="Select NA type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_selected">Select NA type</SelectItem>
                      {NA_TYPES.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>
            </div>
          ) : null}
        </SectionBlock>

        <SectionBlock
          title="Dimensions"
          description="Add the liveable footprint, layout makeup, and operational building details that matter during shortlist and negotiation."
        >
          {visibility.showResidentialDimensions ? (
            <div className="grid gap-5 md:grid-cols-3">
              <FieldGroup label="Configuration">
                <Select value={form.configuration} onValueChange={(value) => setField('configuration', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONFIGURATION_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldGroup>
              <FieldGroup label="Bathrooms">
                <Input type="number" value={form.bathrooms} onChange={(event) => setField('bathrooms', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Balconies">
                <Input type="number" value={form.balconies} onChange={(event) => setField('balconies', event.target.value)} />
              </FieldGroup>
            </div>
          ) : null}

          {visibility.showCommercialDimensions ? (
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-5 md:grid-cols-2">
                <FieldGroup label="Washrooms Type">
                  <ChoiceCardGroup
                    value={form.washroomsType}
                    onValueChange={(value) => setField('washroomsType', value as FormState['washroomsType'])}
                    options={[
                      { value: 'private', label: 'Private' },
                      { value: 'shared', label: 'Shared' },
                    ]}
                    columns={2}
                  />
                </FieldGroup>
                <FieldGroup label="Furnishing Status">
                  <ChoiceCardGroup
                    value={form.commercialFurnishingStatus}
                    onValueChange={(value) => setField('commercialFurnishingStatus', value as FormState['commercialFurnishingStatus'])}
                    options={[
                      { value: 'bare_shell', label: 'Bare Shell' },
                      { value: 'warm_shell', label: 'Warm Shell' },
                      { value: 'fully_furnished', label: 'Fully Furnished' },
                    ]}
                  />
                </FieldGroup>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <ToggleRow label="Central AC" checked={form.centralAc} onCheckedChange={(checked) => setField('centralAc', checked)} />
                <ToggleRow label="DG Backup" checked={form.dgBackup} onCheckedChange={(checked) => setField('dgBackup', checked)} />
                <ToggleRow label="Cafeteria / Pantry" checked={form.cafeteriaPantry} onCheckedChange={(checked) => setField('cafeteriaPantry', checked)} />
                <ToggleRow label="Visitor Parking" checked={form.visitorParking} onCheckedChange={(checked) => setField('visitorParking', checked)} />
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <FieldGroup label="Built-up Area">
              <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                <Input type="number" value={form.builtUpArea} onChange={(event) => setField('builtUpArea', event.target.value)} />
                <Select value={form.builtUpAreaUnit} onValueChange={(value) => setField('builtUpAreaUnit', value as FormState['builtUpAreaUnit'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AREA_UNITS.slice(0, 2).map((unit) => <SelectItem key={unit} value={unit}>{unit.toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </FieldGroup>
            {visibility.showCarpetArea ? (
              <FieldGroup label="Carpet Area">
                <Input type="number" value={form.carpetArea} onChange={(event) => setField('carpetArea', event.target.value)} />
              </FieldGroup>
            ) : null}
          </div>
        </SectionBlock>

        <SectionBlock
          title="RERA Compliance"
          description="Handle the compliance switch, registration number, and certificate attachment with the right emphasis for active registrations."
        >
          <FieldGroup label="RERA Registered?">
            <ChoiceCardGroup
              value={form.reraRegistered ? 'yes' : 'no'}
              onValueChange={(value) => setField('reraRegistered', value === 'yes')}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
              columns={2}
            />
          </FieldGroup>

          <div className="grid gap-5 md:grid-cols-2">
            <FieldGroup label="RERA Registration Number">
              <Input
                value={form.reraRegistrationNumber}
                onChange={(event) => setField('reraRegistrationNumber', event.target.value)}
                disabled={!form.reraRegistered}
                placeholder={form.reraRegistered ? 'Enter registration number' : 'Disabled when RERA is No'}
              />
            </FieldGroup>
            <div className={`rounded-2xl border p-4 transition ${form.reraRegistered ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-white p-2 shadow-sm">
                  <FileText className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">RERA Certificate</p>
                  <p className="text-xs text-slate-500">Upload PDF, JPG, or PNG for compliance records.</p>
                </div>
              </div>
              <input
                ref={reraInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => setReraCertificateFiles(Array.from(event.target.files ?? []))}
                disabled={!form.reraRegistered}
              />
              <Button type="button" variant="outline" onClick={() => reraInputRef.current?.click()} disabled={!form.reraRegistered}>
                Choose Certificate
              </Button>
              {reraCertificateFiles.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {reraCertificateFiles.map((file) => (
                    <div key={file.name} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      {file.name}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </SectionBlock>

        <SectionBlock
          title="Financials"
          description="Only the relevant pricing and commercial logic stays active, so the submit payload follows the chosen property flow."
        >
          {visibility.showResidentialSaleFinancials ? (
            <div className="grid gap-5 md:grid-cols-2">
              <FieldGroup label="Expected Price">
                <Input type="number" value={form.expectedPrice} onChange={(event) => setField('expectedPrice', event.target.value)} />
              </FieldGroup>
              <ToggleRow label="Price Negotiable" checked={form.priceNegotiable} onCheckedChange={(checked) => setField('priceNegotiable', checked)} />
            </div>
          ) : null}

          {visibility.showResidentialRentFinancials ? (
            <div className="grid gap-5 md:grid-cols-3">
              <FieldGroup label="Expected Monthly Rent">
                <Input type="number" value={form.expectedMonthlyRent} onChange={(event) => setField('expectedMonthlyRent', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Security Deposit">
                <Input type="number" value={form.securityDeposit} onChange={(event) => setField('securityDeposit', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Tenant Preference">
                <ChoiceCardGroup
                  value={form.tenantPreference}
                  onValueChange={(value) => setField('tenantPreference', value as FormState['tenantPreference'])}
                  options={[
                    { value: 'families', label: 'Families' },
                    { value: 'bachelors', label: 'Bachelors' },
                    { value: 'company_lease', label: 'Company Lease' },
                  ]}
                />
              </FieldGroup>
            </div>
          ) : null}

          {visibility.showResidentialPgFinancials ? (
            <div className="grid gap-5 md:grid-cols-2">
              <FieldGroup label="Monthly Rent per Bed">
                <Input type="number" value={form.monthlyRentPerBed} onChange={(event) => setField('monthlyRentPerBed', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Security Deposit">
                <Input type="number" value={form.securityDeposit} onChange={(event) => setField('securityDeposit', event.target.value)} />
              </FieldGroup>
            </div>
          ) : null}

          {visibility.showCommercialSaleFinancials ? (
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-5 md:grid-cols-2">
                <FieldGroup label="Total Price">
                  <Input type="number" value={form.totalPrice} onChange={(event) => setField('totalPrice', event.target.value)} />
                </FieldGroup>
                <div className="grid gap-3">
                  <ToggleRow label="Price Negotiable" checked={form.priceNegotiable} onCheckedChange={(checked) => setField('priceNegotiable', checked)} />
                  <ToggleRow label="Pre-Leased Property" checked={form.preLeasedProperty} onCheckedChange={(checked) => setField('preLeasedProperty', checked)} />
                </div>
              </div>
              {visibility.showPreLeasedFields ? (
                <div className="grid gap-5 md:grid-cols-3">
                  <FieldGroup label="Current Tenant Name">
                    <Input value={form.currentTenantName} onChange={(event) => setField('currentTenantName', event.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Monthly Rent Received">
                    <Input type="number" value={form.monthlyRentReceived} onChange={(event) => setField('monthlyRentReceived', event.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Lease Expiry Date">
                    <Input type="date" value={form.leaseExpiryDate} onChange={(event) => setField('leaseExpiryDate', event.target.value)} />
                  </FieldGroup>
                </div>
              ) : null}
            </div>
          ) : null}

          {visibility.showCommercialRentFinancials ? (
            <div className="grid gap-5 md:grid-cols-3">
              <FieldGroup label="Monthly Rent">
                <Input type="number" value={form.monthlyRent} onChange={(event) => setField('monthlyRent', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Security Deposit">
                <Input type="number" value={form.securityDeposit} onChange={(event) => setField('securityDeposit', event.target.value)} />
              </FieldGroup>
              <FieldGroup label="Lock-in Period">
                <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                  <Input type="number" value={form.lockInPeriod} onChange={(event) => setField('lockInPeriod', event.target.value)} />
                  <Select value={form.lockInPeriodUnit} onValueChange={(value) => setField('lockInPeriodUnit', value as FormState['lockInPeriodUnit'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FieldGroup>
              <div className="md:col-span-3">
                <ToggleRow label="Revenue Share Model" checked={form.revenueShareModel} onCheckedChange={(checked) => setField('revenueShareModel', checked)} />
              </div>
            </div>
          ) : null}

          {visibility.showLandSaleFinancials ? (
            <div className="grid gap-5 md:grid-cols-2">
              <FieldGroup label="Total Price">
                <Input type="number" value={form.totalPrice} onChange={(event) => setField('totalPrice', event.target.value)} />
              </FieldGroup>
              <ToggleRow label="Price Negotiable" checked={form.priceNegotiable} onCheckedChange={(checked) => setField('priceNegotiable', checked)} />
            </div>
          ) : null}

          {visibility.showConstructionStatus ? (
            <FieldGroup label="Construction Status">
              <ChoiceCardGroup
                value={form.constructionStatus}
                onValueChange={(value) => setField('constructionStatus', value as FormState['constructionStatus'])}
                options={[
                  { value: 'ready_to_move', label: 'Ready to Move' },
                  { value: 'under_construction', label: 'Under Construction' },
                ]}
                columns={2}
              />
            </FieldGroup>
          ) : null}
        </SectionBlock>

        <SectionBlock
          title="Amenities"
          description="Finish the merchandising layer with furnishing, parking, standout features, and the narrative that sells the property well."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FieldGroup label="Furnishing">
              <ChoiceCardGroup
                value={form.furnishing}
                onValueChange={(value) => setField('furnishing', value as FormState['furnishing'])}
                options={[
                  { value: 'fully_furnished', label: 'Fully Furnished' },
                  { value: 'semi_furnished', label: 'Semi Furnished' },
                  { value: 'unfurnished', label: 'Unfurnished' },
                ]}
              />
            </FieldGroup>
            <FieldGroup label="Parking">
              <ChoiceCardGroup
                value={form.parking}
                onValueChange={(value) => setField('parking', value as FormState['parking'])}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'covered', label: 'Covered' },
                ]}
                columns={2}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Special Features">
            <ChipMultiSelect
              options={SPECIAL_FEATURE_OPTIONS}
              selected={form.specialFeatures}
              onToggle={(value) => setField('specialFeatures', toggleArrayValue(form.specialFeatures, value))}
            />
          </FieldGroup>

          <FieldGroup label="Property USP / Description">
            <Textarea
              rows={6}
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              placeholder="Describe the strongest selling points, context, and standout livability of this property."
            />
          </FieldGroup>
        </SectionBlock>

        <SectionBlock
          title="Media and Attachments"
          description="Upload the visual assets and links the team needs for a confident launch package."
        >
          <div className="space-y-5">
            <div
              onDragOver={(event) => { event.preventDefault(); setIsDraggingGallery(true) }}
              onDragLeave={() => setIsDraggingGallery(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${isDraggingGallery ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50/70'}`}
            >
              <input
                ref={galleryInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(event) => handleGallerySelection(event.target.files)}
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <UploadCloud className="h-5 w-5 text-emerald-700" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-900">Main Photo Gallery</p>
              <p className="mt-1 text-sm text-slate-500">Drag and drop images here, or choose files from your device.</p>
              <Button type="button" className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => galleryInputRef.current?.click()}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
            </div>

            {galleryPreviews.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={preview} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img src={preview} alt={`Preview ${index + 1}`} className="h-40 w-full object-cover" />
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500">
                      <span className="truncate">{galleryFiles[index]?.name}</span>
                      <button
                        type="button"
                        onClick={() => setGalleryFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <FileImage className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Floor Plans</p>
                    <p className="text-xs text-slate-500">PDF, JPG, or PNG placeholders for brokers and buyers.</p>
                  </div>
                </div>
                <input
                  ref={floorPlanInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(event) => setFloorPlanFiles(Array.from(event.target.files ?? []))}
                />
                <Button type="button" variant="outline" onClick={() => floorPlanInputRef.current?.click()}>
                  Choose Floor Plans
                </Button>
                {floorPlanFiles.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {floorPlanFiles.map((file) => (
                      <div key={file.name} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                        {file.name}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <FieldGroup label="Video Tour URL" hint="Supports YouTube, Matterport, and other hosted walkthrough links.">
                  <Input value={form.videoTourUrl} onChange={(event) => setField('videoTourUrl', event.target.value)} placeholder="https://..." />
                </FieldGroup>
              </div>
            </div>
          </div>
        </SectionBlock>

        <section className="sticky bottom-4 z-10">
          <Card className="border-slate-200 bg-white/95 shadow-lg backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Footer Actions</CardTitle>
              <CardDescription>Save the property or step back without losing your place in the CRM workflow.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1 text-sm">
                <p className={`font-medium ${saveState === 'error' ? 'text-red-600' : saveState === 'success' ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {saveState === 'saving' ? 'Saving in progress...' : saveMessage}
                </p>
                <p className="text-slate-500">{lastSavedAt ? `Last saved: ${lastSavedAt}` : 'No save has been completed yet.'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/crm/listings')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saveState === 'saving'}>
                  {saveState === 'saving' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Property
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </form>
    </div>
  )
}
