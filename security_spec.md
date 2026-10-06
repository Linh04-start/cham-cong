# Security Specification for Personal Timesheet & Work Expense App

## 1. Zero-Trust Access Model
- Purely personal workspace: No managers, bosses, or public access.
- Every user must be authenticated (`request.auth != null`).
- A user can ONLY read, create, update, and delete documents where `request.auth.uid == userId`.
- Cross-user data leakage is mathematically blocked by path-based access control (`/users/{userId}/...`).

## 2. Invariants & Data Integrity
- User Profile: `uid` must match `request.auth.uid`. Hourly rate, target, and coffee price must be non-negative numbers.
- Timesheet Entries:
  - Must belong to the authenticated owner (`request.auth.uid == userId`).
  - Work hours and total pay must be valid numbers >= 0.
  - Date format must follow `YYYY-MM-DD`.
  - ID must be alphanumeric/dashes.
- Work Expenses:
  - Must belong to the authenticated owner (`request.auth.uid == userId`).
  - Amount must be a positive number (> 0 and <= 1,000,000,000).
  - Category must be one of allowed categories (`milktea`, `coffee`, `food`, `gas`, `parking`, `snack`, `other`).
  - Date format must follow `YYYY-MM-DD`.
