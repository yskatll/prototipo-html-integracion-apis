export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface Pedido {
  id_pedido: number
  folio: string
  id_tipo_documento: number | null
  id_proveedor: number
  fecha_pedido: string
  numero_contrato: string
  destinatario_factura: string
  tiempo_entrega: string
  id_usuario_elaboro: number | null
  id_usuario_autorizo: number | null
  iniciales_responsables: string | null
  id_estatus_pedido: number | null
  id_procedimiento: number | null
  id_fuente_financiamiento_federal: number | null
  observaciones_generales: string | null
  subtotal: number
  iva_total: number | null
  retenciones_total: number | null
  total_general: number | null
  fecha_registro: string
  id_usuario_registro: number
  id_firma_elaboro: number | null
  id_firma_autorizo: number | null
  id_proveedor_cat_proveedor: {
    id_proveedor: number
    razon_social: string
    nombre_comercial: string | null
    rfc: string | null
    email: string | null
    telefono: string | null
    activo: boolean | null
  }
  id_usuario_registro_Spartan_User: {
    Id_User: number
    Name: string
    Role: string | null
    Image: string | null
    Email: string | null
    Status: string | null
    Username: string | null
    Password: string | null
  }
}

export interface PedidosResponse {
  pedidos: Pedido[]
  RowCount: number
}

class ApiService {
  private baseUrl = 'http://localhost:3001/api' // Usar servidor proxy personalizado
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  private async tryAuthWithFormData(): Promise<Response> {
    console.log('Intentando autenticación con form-data...')
    
    const formData = new URLSearchParams()
    formData.append('grant_type', 'client_credentials')
    
    return fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData
    })
  }

  private async tryAuthWithoutBody(): Promise<Response> {
    console.log('Intentando autenticación sin body...')
    
    return fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })
  }

  async getAccessToken(): Promise<string> {
    // Si tenemos un token válido, lo devolvemos
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      console.log('Obteniendo nuevo token de acceso...')
      
      let response: Response
      
      const authUrl = `${this.baseUrl}/oauth/token`
      console.log('URL de auth:', authUrl)
      
      // Intentar primero sin body (como funcionaba originalmente)
      console.log('Intentando sin body primero...')
      response = await this.tryAuthWithoutBody()
      console.log('Response status (sin body):', response.status)
      
      // Si falla sin body, intentar con form-data
      if (!response.ok) {
        console.log('Sin body falló, intentando con form-data...')
        response = await this.tryAuthWithFormData()
        console.log('Response status (form-data):', response.status)
        
        // Si también falla con form-data, intentar con diferentes grant types
        if (!response.ok) {
          console.log('Form-data falló, intentando con password grant...')
          const passwordBodyData = new URLSearchParams()
          passwordBodyData.append('grant_type', 'password')
          passwordBodyData.append('username', '')
          passwordBodyData.append('password', '')
          
          response = await fetch(authUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            body: passwordBodyData
          })
          console.log('Response status (password):', response.status)
        }
      }

      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Error al obtener el token de acceso: ${response.status} ${response.statusText}`)
      }

      const authData: AuthResponse = await response.json()
      console.log('Token obtenido exitosamente:', authData.token_type)
      
      this.accessToken = authData.access_token
      // Establecer la expiración con un margen de seguridad de 30 segundos
      this.tokenExpiry = Date.now() + (authData.expires_in - 30) * 1000

      return this.accessToken
    } catch (error) {
      console.error('Error detallado al autenticar:', error)
      
      // Verificar si es un error de CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión: Posible problema de CORS o el servidor no está disponible')
      }
      
      throw error instanceof Error ? error : new Error('Error desconocido al obtener el token')
    }
  }

  async getPedidos(startRowIndex = 1, maximumRows = 10): Promise<PedidosResponse> {
    try {
      console.log('Obteniendo pedidos...', { startRowIndex, maximumRows })
      const token = await this.getAccessToken()
      
      const url = `${this.baseUrl}/api/pedido/ListaSelAll?startRowIndex=${startRowIndex}&maximumRows=${maximumRows}`
      console.log('URL de pedidos:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })

      console.log('Response status pedidos:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response pedidos:', errorText)
        
        // Si es error 401, limpiar token y reintentar una vez
        if (response.status === 401) {
          console.log('Token expirado, limpiando y reintentando...')
          this.clearToken()
          const newToken = await this.getAccessToken()
          
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          })
          
          if (!retryResponse.ok) {
            throw new Error(`Error al obtener pedidos (reintento): ${retryResponse.status} ${retryResponse.statusText}`)
          }
          
          const retryData: PedidosResponse = await retryResponse.json()
          return retryData
        }
        
        throw new Error(`Error al obtener pedidos: ${response.status} ${response.statusText}`)
      }

      const data: PedidosResponse = await response.json()
      console.log('Pedidos obtenidos exitosamente:', data.RowCount, 'registros')
      return data
    } catch (error) {
      console.error('Error detallado al obtener pedidos:', error)
      
      // Verificar si es un error de CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión: Posible problema de CORS o el servidor no está disponible')
      }
      
      throw error instanceof Error ? error : new Error('Error desconocido al obtener pedidos')
    }
  }

  // Método para limpiar el token (útil para logout o errores de autenticación)
  clearToken(): void {
    this.accessToken = null
    this.tokenExpiry = null
  }
}

export const apiService = new ApiService()