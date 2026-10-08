import mongoose from "mongoose";

/**
 * Atomic sequence numbers (used for Member IDs: MEM000001, MEM000002 …).
 * Safe when two people register at the same moment and never re-uses an ID
 * after a member is deleted.
 */
const CounterSchema = new mongoose.Schema(
  {
    _id: { type: String },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

const Counter = mongoose.model("Counter", CounterSchema);

export const nextSequence = async (name) => {
  const doc = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

export default Counter;
