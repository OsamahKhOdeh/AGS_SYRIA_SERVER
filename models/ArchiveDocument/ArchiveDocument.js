import mongoose from "mongoose";

const ArchiveDocumentSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String },
    caseName: { type: String },
    caseDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["DRAFT", "IN_PROGRESS", "COMPLETED"], default: "DRAFT" },
    files: [
      {
        uploaded: { type: Boolean, default: false },
        type: { type: String, enum: ["PKL", "BEOE", "AS", "INVOICE"] },
        path: { type: String },
      },
    ],
    archiveEmployee: { type: String, default: " " },
    acountingEmployee: { type: String, default: " " },
    logisticEmployee: { type: String, default: " " },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ArchiveDocument", ArchiveDocumentSchema);
