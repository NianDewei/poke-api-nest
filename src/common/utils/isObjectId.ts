import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

const isValidObjectId = (id: string): boolean => {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
};

export { isValidObjectId };
