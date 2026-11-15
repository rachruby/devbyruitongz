import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('opens a company from the island and lists roles in Experiences', async () => {
  render(<App />);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open Experiences' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Open OpenTable' }));
  const role = screen.getByRole('dialog');
  expect(role).toHaveTextContent(/AI Engineer Intern/i);
  expect(role).toHaveTextContent(/eval gates/i);

  await userEvent.click(screen.getByRole('button', { name: /^close$/i }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Open Experiences' }));
  const folder = screen.getByRole('dialog');
  expect(within(folder).getByRole('button', { name: /OpenTable/i })).toBeInTheDocument();
  expect(within(folder).getByRole('button', { name: /CIBC/i })).toBeInTheDocument();
  expect(within(folder).getByRole('button', { name: /Co-operators/i })).toBeInTheDocument();
});
