import { it, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/render';
import CreateUserModal from './CreateUserModal';

vi.mock('../lib/auth-client', () => ({
  useSession: () => ({ data: { user: { name: 'Admin', role: 'admin' } } }),
  signOut: vi.fn(),
}));

it('does ANY validation error appear when ONLY email is invalid?', async () => {
  const user = userEvent.setup();
  renderWithProviders(<CreateUserModal open={true} onOpenChange={() => {}} />);
  // Only set email invalid, leave name & password empty
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
  await user.click(screen.getByRole('button', { name: /create user/i }));
  const errors = document.querySelectorAll('.text-destructive');
  console.log('errors found:', errors.length);
  errors.forEach(e => console.log(' -', e.textContent));
});
