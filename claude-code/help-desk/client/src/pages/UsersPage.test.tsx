import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '../test/render';
import UsersPage from './UsersPage';

vi.mock('../lib/auth-client', () => ({
  useSession: () => ({ data: { user: { name: 'Admin', role: 'admin' } } }),
  signOut: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => vi.fn() };
});

const users = [
  { id: '1', name: 'Alice Admin', email: 'alice@example.com', role: 'admin', createdAt: '2024-01-15T00:00:00.000Z' },
  { id: '2', name: 'Bob Agent', email: 'bob@example.com', role: 'agent', createdAt: '2024-03-20T00:00:00.000Z' },
];

const server = setupServer(
  http.get('/api/users', () => HttpResponse.json(users))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UsersPage', () => {
  it('shows skeleton rows while loading', () => {
    renderWithProviders(<UsersPage />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders the page heading', async () => {
    renderWithProviders(<UsersPage />);
    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
  });

  it('renders table headers', async () => {
    renderWithProviders(<UsersPage />);
    await waitForElementToBeRemoved(() => document.querySelector('.animate-pulse'));
    expect(screen.getAllByRole('columnheader', { name: /name/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader', { name: /email/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader', { name: /role/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader', { name: /created/i })[0]).toBeInTheDocument();
  });

  it('renders a row for each user', async () => {
    renderWithProviders(<UsersPage />);
    await waitForElementToBeRemoved(() => document.querySelector('.animate-pulse'));
    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Agent')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('shows role badges', async () => {
    renderWithProviders(<UsersPage />);
    await waitForElementToBeRemoved(() => document.querySelector('.animate-pulse'));
    const badges = screen.getAllByText(/admin|agent/);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('shows empty state when no users are returned', async () => {
    server.use(http.get('/api/users', () => HttpResponse.json([])));
    renderWithProviders(<UsersPage />);
    await waitForElementToBeRemoved(() => document.querySelector('.animate-pulse'));
    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    server.use(http.get('/api/users', () => HttpResponse.json({ error: 'Forbidden' }, { status: 403 })));
    renderWithProviders(<UsersPage />);
    await waitForElementToBeRemoved(() => document.querySelector('.animate-pulse'));
    expect(screen.getByText(/403|forbidden|request failed/i)).toBeInTheDocument();
  });

  it('shows the dialog when the New User button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);
    await user.click(screen.getByRole('button', { name: /new user/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('hides the dialog when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);
    await user.click(screen.getByRole('button', { name: /new user/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('hides the dialog when clicking outside', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);
    await user.click(screen.getByRole('button', { name: /new user/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement;
    await user.click(overlay);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
