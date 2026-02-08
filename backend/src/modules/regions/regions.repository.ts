import { supabaseAnon } from '../../shared/database/supabaseClient.js'

export interface RegionEntity {
  id: string
  name: string
}

export class RegionsRepository {
  async findAll(): Promise<RegionEntity[]> {
    const { data, error } = await supabaseAnon
      .from('regions')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.warn('Erro ao buscar regiões:', error.message)
      return []
    }
    return data || []
  }
}
