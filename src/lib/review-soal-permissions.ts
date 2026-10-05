import { ReviewSoalFormData } from '@/types/monev';

/**
 * Checks whether the current user is allowed to edit or delete a Review Soal form.
 * Permitted users:
 * 1. ADMIN role
 * 2. The user who created the form (creator)
 * 3. The user assigned as the peninjau (reviewer)
 * 
 * Users who are neither creator nor peninjau only have read/print access.
 */
export function canModifyReviewSoal(
  form: ReviewSoalFormData | null | undefined,
  user: any
): boolean {
  if (!form || !user) return false;

  const role = user.role ? String(user.role).toUpperCase() : '';
  if (role === 'ADMIN') return true;

  const userDosenId = user.dosen_id || user.id;
  const userNik = user.nik ? String(user.nik).trim() : '';
  const userName = (user.name || user.nama || '').trim().toLowerCase();

  // 1. Check if user is the creator
  if (userDosenId && form.created_by_dosen_id && form.created_by_dosen_id === userDosenId) {
    return true;
  }
  if (userNik && form.created_by_nik && String(form.created_by_nik).trim() === userNik) {
    return true;
  }
  if (userName && form.created_by_nama && form.created_by_nama.trim().toLowerCase() === userName) {
    return true;
  }

  // 2. Check if user is the assigned peninjau (reviewer)
  if (userDosenId && form.peninjau_dosen_id && form.peninjau_dosen_id === userDosenId) {
    return true;
  }
  if (userNik && form.peninjau_nik && String(form.peninjau_nik).trim() === userNik) {
    return true;
  }
  if (userName && form.peninjau_nama && form.peninjau_nama.trim().toLowerCase() === userName) {
    return true;
  }

  return false;
}
