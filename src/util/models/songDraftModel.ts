import mongoose, { Schema, Document, Model } from "mongoose";


const featuredArtistSchema = new mongoose.Schema({
  artistName: {
    type: String,
    // required: [true, 'Artist name is required']
  },
  spotifyId: {
    type: String,
    // // required: [true, 'Spotify ID is required']
  },
  appleId: {
    type: String,
    // // required: [true, 'Apple ID is required']
  }
}, { _id: false });

const performerSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, 'Performer name is required']
  },
  role: {
    type: String,
    // required: [true, 'Performer role is required']
  }
}, { _id: false });

const songWriterSchema = new mongoose.Schema({
  first_name: {
    type: String,
    // required: [true, 'Song writer first name is required']
  },
  last_name: {
    type: String,
    // required: [true, 'Song writer last name is required']
  }
}, { _id: false });

const producerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, "Producer name is required"],
    },
    // first_name: {
    //   type: String,
    //   required: [true, "Producer first name is required"],
    // },
    // last_name: {
    //   type: String,
    //   required: [true, "Producer last name is required"],
    // },
  },
  { _id: false }
);

const SongDraftModelSchema = new mongoose.Schema({
  releaseTitle: {
    type: String,
    // required: [true, 'Title is required'],
    trim: true
  },
  genre: {
    type: String,
    // required: [true, 'Genre is required'],
    trim: true
  },
  releaseLanguage: {
    type: String,
    // required: [true, 'Language is required'],
    trim: true
  },
  artistName: {
    type: String,
    // required: [true, 'Artist is required'],
    trim: true
  },
  artist: {
    type: String,
    // required: [true, 'Artist is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: [true, "Provide a user!"],
  },
  releaseDate: {
    type: Date,
    // required: [true, 'Release date is required']
  },
  preOrderDate: {
    type: Date ,
    // required: [true, 'Pre-order date is required']
    default:null
  },
  featuredArtist: {
    type: [featuredArtistSchema],
    required: [true, 'Featured artist is required'],
    // validate: {
    //   validator: function(v: any[]) {
    //     return v && v.length > 0;
    //   },
    //   message: 'At least one featured artist is required'
    // },
    // default:[{ artistName: "", spotifyId: "", appleId: "" }]
  },
  performer: {
    type: [performerSchema],
    // required: [true, 'Performer is required'],
    // validate: {
    //   validator: function(v: any[]) {
    //     return Array.isArray(v) && v.length > 0;
    //   },
    //   message: 'At least one performer is required'
    // }
  },
  releaseWriter: {
    type: [songWriterSchema],
    // required: [true, 'Song writer is required'],
    // validate: {
    //   validator: function(v: any[]) {
    //     return Array.isArray(v) && v.length > 0;
    //   },
    //   message: 'At least one song writer is required'
    // }
  },
  producer: {
    type: [producerSchema],
    // required: [true, 'Producer is required'],
    // validate: {
    //   validator: function(v: any[]) {
    //     return Array.isArray(v) && v.length > 0;
    //   },
    //   message: 'At least one producer is required'
    // }
  },
  preOrderCheck: {
    type: Boolean,
    // required: [true, 'Pre-order check is required'],
    default: false
  },
  anotherDistributionCheck: {
    type: Boolean,
    // required: [true, 'Another distribution check is required'],
    default: false
  },
  territories: {
    type: [String],
    // required: [true, 'Territories are required'],
    // validate: {
    //   validator: function(v: any[]) {
    //     return Array.isArray(v) && v.length > 0;
    //   },
    //   message: 'At least one territory is required'
    // }
  },
  releaseAudio: {
    type: String,
    // required: [true, 'Song audio URL is required'],
    trim: true
  },
  releaseImage: {
    type: String,
    // required: [true, 'Music image URL is required'],
    trim: true
  },
  dsp: {
    type: [String],
    // required: [true, 'DSP (Digital Service Providers) are required'],
    // validate: {
    //   validator: function(v: any[]) {
    //     return Array.isArray(v) && v.length > 0;
    //   },
    //   message: 'At least one DSP is required'
    // }
  },
  lyrics: {
    type: String,
    // required: [true, 'Lyrics are required'],
    trim: true
  },
  startClip: {
    type: String,
    // required: [true, 'Start clip is required'],
    trim: true
  },
  isrc: {
    type: String,
    // required: [true, 'ISRC is required'],
    trim: true,
    uppercase: true
  },
  upc: {
    type: String,
    // required: [true, 'UPC is required'],
    trim: true
  },
  copyRightHolder: {
    type: String,
    // required: [true, 'Copyright holder is required'],
    trim: true
  },
  copyRightYear: {
    type: String,
    // required: [true, 'Copyright year is required'],
    trim: true
  },
  explicitContent: {
    type: Boolean,
    // required: [true, 'Explicit content flag is required'],
    default: false
  },
  releaseStatus:{
    type:String,
    // enum:["pending","approved","rejected"],
    default:"draft"
  },
  catalogNumber:{
    type:String,
    // required: [true, "catalog number is required"],
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
// SongModelSchema.index({ artist: 1, release_date: -1 });
// // SongModelSchema.index({ genre: 1 });
// SongModelSchema.index({ isrc: 1 }, { unique: true });
// SongModelSchema.index({ upc: 1 },{unique: true});
// delete mongoose.models.SongDraft;

const SongDraftModel = mongoose.models?.SongDraft || mongoose.model('SongDraft', SongDraftModelSchema);

export default SongDraftModel;
