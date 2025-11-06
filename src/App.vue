<script setup lang="ts">
import { ref, reactive } from 'vue'
import FiltersSection from './components/FiltersSection.vue'
import ResultsTable from './components/ResultsTable.vue'
import { apiService, type Pedido } from './services/apiService'

// Estado para los filtros
const filters = reactive({
  year: '2025',
  folio: '',
  supplier: '',
  budgetKey: '',
  orderType: '',
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31',
  status: ''
})

// Estado para los resultados
const pedidos = ref<Pedido[]>([])
const totalCount = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const hasSearched = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// Métodos para manejar eventos del componente FiltersSection
const handleSearch = async (filterData: any) => {
  console.log('Búsqueda realizada con filtros:', filterData)
  
  loading.value = true
  error.value = null
  hasSearched.value = true
  currentPage.value = 1
  
  try {
    const startRowIndex = ((currentPage.value - 1) * pageSize.value) + 1
    const response = await apiService.getPedidos(startRowIndex, pageSize.value)
    
    pedidos.value = response.pedidos
    totalCount.value = response.RowCount
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los pedidos'
    pedidos.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

const handleFilterChange = (filterData: any) => {
  console.log('Filtros cambiados:', filterData)
  Object.assign(filters, filterData)
}

const handleClearFilters = () => {
  console.log('Filtros limpiados')
  // Limpiar también los resultados
  pedidos.value = []
  totalCount.value = 0
  hasSearched.value = false
  error.value = null
}

const handleAdvancedFilters = () => {
  console.log('Mostrar filtros avanzados')
  // Aquí iría la lógica para mostrar filtros avanzados
}

// Métodos para manejar eventos de la tabla de resultados
const handlePageChange = async (page: number) => {
  currentPage.value = page
  loading.value = true
  error.value = null
  
  try {
    const startRowIndex = ((page - 1) * pageSize.value) + 1
    const response = await apiService.getPedidos(startRowIndex, pageSize.value)
    
    pedidos.value = response.pedidos
    totalCount.value = response.RowCount
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los pedidos'
  } finally {
    loading.value = false
  }
}

const handleExportExcel = () => {
  console.log('Exportar a Excel')
  // Aquí iría la lógica para exportar a Excel
  alert('Funcionalidad de exportación a Excel en desarrollo')
}

const handleExportPDF = () => {
  console.log('Exportar a PDF')
  // Aquí iría la lógica para exportar a PDF
  alert('Funcionalidad de exportación a PDF en desarrollo')
}

const handlePrint = () => {
  console.log('Imprimir')
  // Aquí iría la lógica para imprimir
  window.print()
}

const handleShowDetail = (pedido: Pedido) => {
  console.log('Mostrar detalle del pedido:', pedido)
  // Aquí iría la lógica para mostrar el detalle del pedido
  alert(`Detalle del pedido: ${pedido.folio}\nProveedor: ${pedido.id_proveedor_cat_proveedor?.razon_social || 'N/A'}`)
}
</script>

<template>
  <div class="app-container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title" data-i18n="orders.consultation.title">
        <i class="fas fa-search"></i>
        Consulta de Pedidos
      </h1>
      <p class="page-subtitle" data-i18n="orders.consultation.subtitle">
        Consulte y analice todas las órdenes de pedido de compras con información detallada y filtros avanzados
      </p>
    </div>

    <!-- Componente de Filtros -->
    <FiltersSection 
      :initial-filters="filters"
      @search="handleSearch"
      @filter-change="handleFilterChange"
      @clear-filters="handleClearFilters"
      @advanced-filters="handleAdvancedFilters"
    />

    <!-- Componente de Resultados -->
    <ResultsTable
      :pedidos="pedidos"
      :total-count="totalCount"
      :loading="loading"
      :error="error"
      :has-searched="hasSearched"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @export-excel="handleExportExcel"
      @export-pdf="handleExportPDF"
      @print="handlePrint"
      @show-detail="handleShowDetail"
    />
  </div>
</template>

<style>
body {
  overflow-y: auto;
  margin: 0;
  padding: 20px;
  background-color: #F5F7FA;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2C3E50;
}

.app-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(13, 75, 118, 0.1);
  padding: 30px;
  margin-bottom: 20px;
}

.page-header {
  background: linear-gradient(135deg, #0D4B76 0%, #1A6B9F 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(13, 75, 118, 0.3);
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 10px 0 0 0;
}



.alert-info {
  background: #CCE5FF;
  border-color: #1A6B9F;
  color: #004085;
  border-radius: 8px;
  padding: 15px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  body {
    padding: 10px;
  }
  
  .app-container {
    padding: 20px;
  }
}
</style>
