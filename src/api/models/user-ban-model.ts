import { Schema, Types } from 'mongoose'

interface UserBanModel {
  created: Date
  updated: Date
  expires: Date
  creator: Types.ObjectId
  target: Types.ObjectId
  approve: boolean
  reasons: Array<Record<string, string>>
  comments: Array<Types.ObjectId>
  closed: boolean
}

const userBanSchema = new Schema<UserBanModel>({
  created: { type: Date },
  updated: { type: Date },
  expires: { type: Date },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  target: { type: Schema.Types.ObjectId, ref: 'User' },
  approve: { type: Boolean, default: false },
  comments: { type: [Types.ObjectId], ref: 'Comment' },
  closed: { type: Boolean, default: false }
})