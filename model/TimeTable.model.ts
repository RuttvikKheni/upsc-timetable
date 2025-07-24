import mongoose from 'mongoose';

const TimeTableSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  aspirantType: { type: String, required: true }, 
  subjectsPerDay: { type: String, required: true },
  attemptedBefore: { type: String, required: true }, 
  prelimsScore: { type: String, default: "" },
  clearedMains: { type: String, required: true }, 
  mainsScore: { type: String, default: "" },
  academicQualification: { type: String, required: true },
  academicPerformance: { type: String, required: true },
  preparationStartDate: { type: Date, required: true },
  targetYear: { type: String, required: true },
  confidentSubjects: [{ type: String }],
  difficultSubjects: [{ type: String }],
  completedNCERTs: { type: String, required: true }, 
  completedStandardBooks: { type: String, required: true }, 
  startedSubjects: [{ type: String }],
  finishedSubjects: [{ type: String }],
  halfDoneSubjects: [{ type: String }],
  selectedOptional: { type: String, required: true }, 
  optionalSubject: { type: String, default: "" },
  startedOptional: { type: String, default: "" },
  dailyHours: { type: String, required: true },
  preferredStartTime: { type: String, required: true }, 
  sleepTime: { type: String, required: true },
  weeklyOffDays: [{ type: String }],
  razorpayOrderId: { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },
  razorpayPaymentStatus: { type: String},
  amount: { type: String },
  status:{type:String,default:"null"},
  downloadStatus:{type:String,default:"Pending"}
}, {
    timestamps: true
});

const TimeTable = mongoose.models.TimeTable || mongoose.model('TimeTable', TimeTableSchema);

export default TimeTable;
