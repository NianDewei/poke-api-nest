import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/pokemon-res.interface';
import { PokemonForDB } from './interfaces/pokemon-for-db.interface';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async createData() {
    // 01| We clean existing data in the db
    await this.pokemonModel.deleteMany({});
    // 02| ----->
    const amount = 650;
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${amount}`;

    // make request
    const data = await this.http.get<PokeResponse>(url);

    const pokemons: PokemonForDB[] = data.results.map((pokemon) => {
      // --->
      const { name, url } = pokemon;
      const no = this.extracId(url);

      const pokemonForDb = { name, no };
      return pokemonForDb;
    });

    await this.pokemonModel.insertMany(pokemons);
    return 'Seed Executed, good job';
  }

  private extracId(url: string): number {
    const segments = url.split('/');
    const id = +segments[segments.length - 2];
    return id;
  }
}
