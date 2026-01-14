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

const producerSchema = new mongoose.Schema({
  first_name: {
    type: String,
    // required: [true, 'Producer first name is required']
  },
  last_name: {
    type: String,
    // required: [true, 'Producer last name is required']
  }
}, { _id: false });

const SongDraftModelSchema = new mongoose.Schema({
  songTitle: {
    type: String,
    // required: [true, 'Title is required'],
    trim: true
  },
  genre: {
    type: String,
    // required: [true, 'Genre is required'],
    trim: true
  },
  songLanguage: {
    type: String,
    // required: [true, 'Language is required'],
    trim: true
  },
  artist: {
    type: String,
    // required: [true, 'Artist is required'],
    trim: true
  },
  release_date: {
    type: Date,
    // required: [true, 'Release date is required']
  },
  preOrderDate: {
    type: Date ,
    // required: [true, 'Pre-order date is required']
    default:null
  },
  featured_artist: {
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
  song_writer: {
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
  pre_order_check: {
    type: Boolean,
    // required: [true, 'Pre-order check is required'],
    default: false
  },
  another_distribution_check: {
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
  song_audio: {
    type: String,
    // required: [true, 'Song audio URL is required'],
    trim: true
  },
  song_image: {
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
  start_clip: {
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
  explicit_content: {
    type: Boolean,
    // required: [true, 'Explicit content flag is required'],
    default: false
  },
  songStatus:{
    type:String,
    // enum:["pending","approved","rejected"],
    default:"draft"
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
// SongModelSchema.index({ artist: 1, release_date: -1 });
// // SongModelSchema.index({ genre: 1 });
// SongModelSchema.index({ isrc: 1 }, { unique: true });
// SongModelSchema.index({ upc: 1 },{unique: true});
delete mongoose.models.SongDraft;

const SongDraftModel = mongoose.models.SongDraft || mongoose.model('SongDraft', SongDraftModelSchema);

export default SongDraftModel;
