export default interface User {
  confirmed_at: string | null;
  email: string;
  form_count: number;
  id: number;
  is_admin: boolean;
  name: string;
}
