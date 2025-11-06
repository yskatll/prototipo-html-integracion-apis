<template>
  <div class="filters-section">
    <h3 class="filters-title" data-i18n="filters.title">
      <i class="fas fa-filter"></i>
      Filtros de Búsqueda
    </h3>
    
    <div class="row">
      <div class="col-md-3 mb-3">
        <label class="form-label" data-i18n="filters.year">Año *</label>
        <select 
          class="form-select" 
          id="yearFilter" 
          v-model="filters.year" 
          required
          @change="$emit('filter-change', filters)"
        >
          <option value="" data-i18n="filters.select_year">Seleccione un año</option>
          <option value="2025" selected>2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
        </select>
      </div>
      
      <div class="col-md-3 mb-3">
        <label class="form-label" data-i18n="filters.folio">Folio</label>
        <input 
          type="text" 
          class="form-control" 
          id="folioFilter" 
          v-model="filters.folio"
          placeholder="Ej: PED-2024-001"
          @input="$emit('filter-change', filters)"
        >
      </div>
      
      <div class="col-md-3 mb-3">
        <label class="form-label" data-i18n="filters.supplier">Proveedor</label>
        <select 
          class="form-select" 
          id="supplierFilter"
          v-model="filters.supplier"
          @change="$emit('filter-change', filters)"
        >
          <option value="" data-i18n="filters.all_suppliers">Todos los proveedores</option>
          <option value="PROV001">Distribuidora Industrial del Centro S.A. de C.V.</option>
          <option value="PROV002">Suministros Técnicos Hidalgo S.A. de C.V.</option>
          <option value="PROV003">Comercializadora de Equipos Gubernamentales</option>
          <option value="PROV004">Papelería y Suministros Oficina Total</option>
          <option value="PROV005">Constructora y Servicios Múltiples del Estado</option>
        </select>
      </div>
      
      <div class="col-md-3 mb-3">
        <label class="form-label" data-i18n="filters.budget_key">Clave Presupuestal</label>
        <select 
          class="form-select" 
          id="budgetFilter"
          v-model="filters.budgetKey"
          @change="$emit('filter-change', filters)"
        >
          <option value="" data-i18n="filters.all_budget_keys">Todas las claves</option>
          <option value="2110">2110 - Materiales de Administración</option>
          <option value="2120">2120 - Materiales y Artículos de Construcción</option>
          <option value="2140">2140 - Materiales y Artículos Metálicos</option>
          <option value="2150">2150 - Material Eléctrico y Electrónico</option>
          <option value="2160">2160 - Material de Limpieza</option>
          <option value="2170">2170 - Materiales y Útiles de Impresión</option>
        </select>
      </div>
      
      <div class="col-md-3 mb-3">
        <label class="form-label" data-i18n="filters.order_type">Tipo de Pedido</label>
        <select 
          class="form-select" 
          id="typeFilter"
          v-model="filters.orderType"
          @change="$emit('filter-change', filters)"
        >
          <option value="" data-i18n="filters.all_types">Todos los tipos</option>
          <option value="NORMAL">Normal</option>
          <option value="URGENTE">Urgente</option>
          <option value="PROGRAMADO">Programado</option>
          <option value="ESPECIAL">Especial</option>
        </select>
      </div>
      
      <div class="col-md-3 mb-3">
        <label class="form-label" data-i18n="filters.date_from">Fecha Desde</label>
        <input 
          type="date" 
          class="form-control" 
          id="dateFromFilter" 
          v-model="filters.dateFrom"
          @change="$emit('filter-change', filters)"
        >
      </div>
      
      <div class="col-md-3 mb-3">
        <label class="form-label" data-i18n="filters.date_to">Fecha Hasta</label>
        <input 
          type="date" 
          class="form-control" 
          id="dateToFilter" 
          v-model="filters.dateTo"
          @change="$emit('filter-change', filters)"
        >
      </div>
      
      <div class="col-md-3 mb-3">
        <label class="form-label" data-i18n="filters.status">Estado</label>
        <select 
          class="form-select" 
          id="statusFilter"
          v-model="filters.status"
          @change="$emit('filter-change', filters)"
        >
          <option value="" data-i18n="filters.all_status">Todos los estados</option>
          <option value="COMPLETO">Completo</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PARCIAL">Parcial</option>
        </select>
      </div>
    </div>
    
    <div class="row mt-3">
      <div class="col-12">
        <div class="d-flex gap-3 flex-wrap">
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSearch"
          >
            <i class="fas fa-search"></i>
            <span data-i18n="buttons.search">Buscar</span>
          </button>
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="handleClearFilters"
          >
            <i class="fas fa-eraser"></i>
            <span data-i18n="buttons.clear">Limpiar Filtros</span>
          </button>
          <button 
            type="button" 
            class="btn btn-info" 
            @click="handleAdvancedFilters"
          >
            <i class="fas fa-cog"></i>
            <span data-i18n="buttons.advanced_filters">Filtros Avanzados</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

// Definir los props
interface Props {
  initialFilters?: FilterData
}

// Definir la interfaz para los filtros
interface FilterData {
  year: string
  folio: string
  supplier: string
  budgetKey: string
  orderType: string
  dateFrom: string
  dateTo: string
  status: string
}

// Props
const props = withDefaults(defineProps<Props>(), {
  initialFilters: () => ({
    year: '2024',
    folio: '',
    supplier: '',
    budgetKey: '',
    orderType: '',
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    status: ''
  })
})

// Emits
const emit = defineEmits<{
  'filter-change': [filters: FilterData]
  'search': [filters: FilterData]
  'clear-filters': []
  'advanced-filters': []
}>()

// Estado reactivo de los filtros
const filters = reactive<FilterData>({
  year: props.initialFilters?.year || '2024',
  folio: props.initialFilters?.folio || '',
  supplier: props.initialFilters?.supplier || '',
  budgetKey: props.initialFilters?.budgetKey || '',
  orderType: props.initialFilters?.orderType || '',
  dateFrom: props.initialFilters?.dateFrom || '2024-01-01',
  dateTo: props.initialFilters?.dateTo || '2024-12-31',
  status: props.initialFilters?.status || ''
})

// Métodos
const handleSearch = () => {
  emit('search', filters)
}

const handleClearFilters = () => {
  filters.year = '2024'
  filters.folio = ''
  filters.supplier = ''
  filters.budgetKey = ''
  filters.orderType = ''
  filters.dateFrom = '2024-01-01'
  filters.dateTo = '2024-12-31'
  filters.status = ''
  
  emit('clear-filters')
  emit('filter-change', filters)
}

const handleAdvancedFilters = () => {
  emit('advanced-filters')
}

// Watch para cambios en los filtros
watch(() => props.initialFilters, (newFilters) => {
  if (newFilters) {
    Object.assign(filters, newFilters)
  }
}, { deep: true, immediate: true })
</script>

<style scoped>
.filters-section {
  background: #F8F9FA;
  border: 2px solid #E9ECEF;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.filters-title {
  color: #0D4B76;
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-label {
  font-weight: 600;
  color: #0D4B76;
  margin-bottom: 8px;
}

.form-control, .form-select {
  border: 2px solid #E9ECEF;
  border-radius: 8px;
  padding: 12px 15px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #1A6B9F;
  box-shadow: 0 0 0 0.2rem rgba(26, 107, 159, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #0D4B76 0%, #1A6B9F 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(13, 75, 118, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 75, 118, 0.4);
}

.btn-secondary {
  background: #6c757d;
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-info {
  background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .filters-title {
    font-size: 1.1rem;
  }
  
  .d-flex {
    justify-content: center;
  }
}
</style>