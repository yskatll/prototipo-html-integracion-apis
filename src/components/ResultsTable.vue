<template>
  <div class="results-section">
    <div class="results-header">
      <h3 class="results-title" data-i18n="results.title">
        <i class="fas fa-table"></i>
        Resultados de la Consulta
      </h3>
      <div class="export-buttons" v-if="pedidos.length > 0">
        <button type="button" class="btn btn-success" @click="exportToExcel">
          <i class="fas fa-file-excel"></i>
          <span data-i18n="buttons.export_excel">Exportar a Excel</span>
        </button>
        <button type="button" class="btn btn-warning" @click="exportToPDF">
          <i class="fas fa-file-pdf"></i>
          <span data-i18n="buttons.export_pdf">Exportar a PDF</span>
        </button>
        <button type="button" class="btn btn-info" @click="printReport">
          <i class="fas fa-print"></i>
          <span data-i18n="buttons.print">Imprimir</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-spinner" v-if="loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden" data-i18n="loading">Cargando...</span>
      </div>
      <p class="mt-3" data-i18n="loading.searching">Buscando pedidos...</p>
    </div>

    <!-- Error -->
    <div class="alert alert-danger" v-if="error">
      <i class="fas fa-exclamation-triangle"></i>
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- No Results -->
    <div class="no-results" v-if="!loading && !error && pedidos.length === 0 && hasSearched">
      <i class="fas fa-search fa-3x text-muted mb-3"></i>
      <h4 data-i18n="no_results.title">No se encontraron resultados</h4>
      <p data-i18n="no_results.message">Intente modificar los filtros de búsqueda para obtener resultados.</p>
    </div>

    <!-- Información inicial -->
    <div class="alert alert-info" v-if="!loading && !error && pedidos.length === 0 && !hasSearched">
      <i class="fas fa-info-circle"></i>
      <strong>Información:</strong> Utilice los filtros de búsqueda para consultar los pedidos.
    </div>

    <!-- Estadísticas -->
    <div class="stats-cards" v-if="pedidos.length > 0">
      <div class="stat-card">
        <div class="stat-number">{{ totalCount }}</div>
        <div class="stat-label" data-i18n="stats.total_orders">Total de Pedidos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ formatCurrency(totalAmount) }}</div>
        <div class="stat-label" data-i18n="stats.total_amount">Monto Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ pedidos.length }}</div>
        <div class="stat-label" data-i18n="stats.showing_orders">Mostrando</div>
      </div>
    </div>

    <!-- Tabla de Resultados -->
    <div class="table-container" v-if="pedidos.length > 0">
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th data-i18n="table.folio">Folio</th>
              <th data-i18n="table.order_date">Fecha Pedido</th>
              <th data-i18n="table.supplier">Proveedor</th>
              <th data-i18n="table.rfc">R.F.C</th>
              <th data-i18n="table.contract_number">Número Contrato</th>
              <th data-i18n="table.subtotal">Subtotal</th>
              <th data-i18n="table.total">Total</th>
              <th data-i18n="table.delivery_time">Tiempo Entrega</th>
              <th data-i18n="table.observations">Observaciones</th>
              <th data-i18n="table.actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidos" :key="pedido.id_pedido">
              <td>{{ pedido.folio }}</td>
              <td>{{ formatDate(pedido.fecha_pedido) }}</td>
              <td>{{ pedido.id_proveedor_cat_proveedor?.razon_social || 'N/A' }}</td>
              <td>{{ pedido.id_proveedor_cat_proveedor?.rfc || 'N/A' }}</td>
              <td>{{ pedido.numero_contrato }}</td>
              <td>{{ formatCurrency(pedido.subtotal) }}</td>
              <td>{{ formatCurrency(pedido.total_general || pedido.subtotal) }}</td>
              <td>{{ pedido.tiempo_entrega }}</td>
              <td>{{ pedido.observaciones_generales || 'Sin observaciones' }}</td>
              <td>
                <button 
                  class="btn btn-info btn-sm" 
                  @click="showOrderDetail(pedido)" 
                  title="Ver Detalle"
                >
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="pagination-container" v-if="totalCount > pedidos.length">
        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button 
                class="page-link" 
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
              >
                Anterior
              </button>
            </li>
            
            <li 
              class="page-item" 
              v-for="page in visiblePages" 
              :key="page"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>
            
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button 
                class="page-link" 
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Pedido } from '../services/apiService'

// Props
interface Props {
  pedidos: Pedido[]
  totalCount: number
  loading: boolean
  error: string | null
  hasSearched: boolean
  currentPage?: number
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  pageSize: 10
})

// Emits
const emit = defineEmits<{
  'page-change': [page: number]
  'export-excel': []
  'export-pdf': []
  'print': []
  'show-detail': [pedido: Pedido]
}>()

// Computed
const totalAmount = computed(() => {
  return props.pedidos.reduce((sum, pedido) => {
    return sum + (pedido.total_general || pedido.subtotal || 0)
  }, 0)
})

const totalPages = computed(() => {
  return Math.ceil(props.totalCount / props.pageSize)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, props.currentPage - 2)
  const end = Math.min(totalPages.value, props.currentPage + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00'
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('page-change', page)
  }
}

const exportToExcel = () => {
  emit('export-excel')
}

const exportToPDF = () => {
  emit('export-pdf')
}

const printReport = () => {
  emit('print')
}

const showOrderDetail = (pedido: Pedido) => {
  emit('show-detail', pedido)
}
</script>

<style scoped>
.results-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.results-title {
  color: #0D4B76;
  font-weight: 600;
  font-size: 1.4rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #0D4B76 0%, #1A6B9F 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(13, 75, 118, 0.3);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.table {
  margin: 0;
  font-size: 0.9rem;
}

.table thead th {
  background: linear-gradient(135deg, #0D4B76 0%, #1A6B9F 100%);
  color: white;
  border: none;
  padding: 15px 10px;
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
}

.table tbody td {
  padding: 12px 10px;
  vertical-align: middle;
  border-bottom: 1px solid #E9ECEF;
  text-align: center;
}

.table tbody tr:hover {
  background-color: #F8F9FA;
}

.loading-spinner {
  text-align: center;
  padding: 40px;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6C757D;
}

.export-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-success {
  background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-warning {
  background: linear-gradient(135deg, #F39C12 0%, #E67E22 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}

.btn-info {
  background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pagination-container {
  margin-top: 20px;
}

.pagination .page-link {
  color: #0D4B76;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #0D4B76;
  border-color: #0D4B76;
}

.pagination .page-link:hover {
  color: #0D4B76;
  background-color: #e9ecef;
}

@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .export-buttons {
    justify-content: center;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .table-responsive {
    font-size: 0.8rem;
  }
}
</style>