import { Schema, model, Types, Document } from 'mongoose'

type DashboardPermissionKeys = 'user' | 'ban' | 'trade' | 'terminal'
type DashboardPermissionValue = 'none' | 'view' | 'edit' | 'super'

interface UserBan {
  account: Date
  play: Date
  speak: Date
  text: Date
  comment: Date
  trade: Date
}

interface UserPermissions {
  dashboard: Record<DashboardPermissionKeys, DashboardPermissionValue | undefined> | null
  trade: {
    amount: number
  }
}

interface UserAction {
  activationLink?: string
  activationCode?: string
  activationCodeLink?: string
  activationCodeAttempts?: string
}

export interface UserTrade {
  inventory: {
    size: 7 | 14 | 27 | 36 | number,
    exp: number,
    slots: Array<Types.ObjectId>
  },
  trades: Array<Types.ObjectId>
}

export interface UserProfile {
  usernames?: Array<string>
  avatar?: string
  avatars?: Array<string>
  skin?: string
  skins?: Array<string>
  timePlayed?: number
  server?: {
    online: boolean
    timePlayed: number
    _id: Types.ObjectId
  }
  servers?: Array<{
    timePlayed: number
    _id: Types.ObjectId
  }>
  currency?: number
  badge: Types.ObjectId
  badges?: Array<Types.ObjectId>
  dateCreated: Date
  dateOnline: Date
}

export interface User extends Document, UserAction, UserProfile {
  username: string,
  email: string,
  password: string,
  tokens: Array<Types.ObjectId>
  permissions: UserPermissions,
  ban: UserBan,
  bans: Array<Types.ObjectId>
}

const
  required = true,
  unique = true,
  userSchema = new Schema<User>({
    // User
    username: { type: String, unique, required },
    email: { type: String, unique, required },
    password: { type: String, required },
    tokens: { type: [Schema.Types.ObjectId], ref: 'Token', default: [] },
    permissions: { type: Number },
    // UserActivation
    activationLink: { type: String },
    activationCode: { type: String },
    activationCodeLink: { type: String },
    activationCodeAttempts: { type: String },
    // Profile
    usernames: { type: [String] },
    avatar: { type: String },
    avatars: { type: [String] },
    skin: { type: [String] },
    skins: { type: [String] },
    timePlayed: { type: [Number], default: 0 },
    server: {
      online: { type: Boolean },
      timePlayed: { type: Number },
      _id: { type: Schema.Types.ObjectId, ref: 'Server' }
    },
    servers: {
      type: [{
        timePlayed: { type: Number },
        _id: { type: Schema.Types.ObjectId, ref: 'Server' }
      }],
      default: []
    },
    currency: { type: Number, default: 0 },
    badge: { type: Schema.Types.ObjectId, ref: 'Badge' },
    badges: { type: [Schema.Types.ObjectId], ref: 'Badge' },
    dateCreated: { type: Date },
    dateOnline: { type: Date }
  }, {
    versionKey: false
  })

export default model<User>('User', userSchema)
