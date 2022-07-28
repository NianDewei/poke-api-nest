import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId } from '../common/utils/isObjectId';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const pokemons = await this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      //sort by -> no
      .sort({ no: 1 })
      .select('-__v');

    return pokemons;
  }

  async findOne(term: string) {
    const termSearch = term.toLocaleLowerCase().trim();
    let pokemonFound: Pokemon;
    // search by no
    if (!isNaN(+term)) {
      pokemonFound = await this.pokemonModel.findOne({ no: termSearch });
    }

    // search by id -> objetc id
    if (isValidObjectId(termSearch)) {
      pokemonFound = await this.pokemonModel.findById(termSearch);
    }

    // search by name
    if (!pokemonFound) {
      pokemonFound = await this.pokemonModel.findOne({ name: termSearch });
    }

    if (!pokemonFound)
      throw new NotFoundException(
        `Pokemon with id, name or no << ${termSearch} >> not found`,
      );

    return pokemonFound;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemonFound = await this.findOne(term);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase().trim();
    }

    try {
      await pokemonFound.updateOne(updatePokemonDto);
      return { ...pokemonFound.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
    return pokemonFound;
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne();
    // return { id };
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    // if (!isValidObjectId(id)) {
    //   throw new BadRequestException(`${id} is not a valid MongoID`);
    // }

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id :: ${id} :: not found`);

    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db << ${
          error.keyValue.name || error.keyValue.no
        } >>`,
      );
    }

    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check Server logs`,
    );
  }
}
