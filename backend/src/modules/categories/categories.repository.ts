import { supabaseAnon } from '../../shared/database/supabaseClient.js'

export interface CategoryEntity {
  id: string
  name: string
}

export class CategoriesRepository {
  async findAll(): Promise<CategoryEntity[]> {
    try {
      const { data, error } = await supabaseAnon
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) {
        console.warn('⚠️  Erro ao buscar categorias via Supabase:', error.message)
        return this.getMockedCategories()
      }

      return data || []
    } catch (error) {
      console.warn('⚠️  Falha ao conectar no Supabase. Usando dados mockados.', error)
      return this.getMockedCategories()
    }
  }

  private getMockedCategories(): CategoryEntity[] {
    return [
      { id: '1', name: 'Adestrador' },
      { id: '2', name: 'Advogado' },
      { id: '3', name: 'Ar-condicionado' },
      { id: '4', name: 'Arquiteto' },
      { id: '5', name: 'Babá' },
      { id: '6', name: 'Barbeiro' },
      { id: '7', name: 'Cabeleireira' },
      { id: '8', name: 'Chaveiro' },
      { id: '9', name: 'Diarista' },
      { id: '10', name: 'Eletricista' },
      { id: '11', name: 'Encanador' },
      { id: '12', name: 'Fotógrafo' },
      { id: '13', name: 'Jardineiro' },
      { id: '14', name: 'Mecânico Automotivo' },
      { id: '15', name: 'Montador de móveis' },
      { id: '16', name: 'Pedreiro' },
      { id: '17', name: 'Pintor' },
      { id: '18', name: 'Professor de Inglês' },
      { id: '19', name: 'Psicólogo' },
      { id: '20', name: 'Técnico de informática' }
    ]
  }
}
