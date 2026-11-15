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

test('opens Projects in Finder and switches from columns to the gallery', async () => {
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: 'Open Projects' }));
  const finder = screen.getByRole('dialog');
  expect(finder).toHaveTextContent(/Stanford TreeHacks 2025/i);
  expect(within(finder).getByRole('radio', { name: 'Column view' })).toHaveAttribute('aria-checked', 'true');

  await userEvent.click(within(finder).getByRole('option', { name: /Rewind/i }));
  expect(finder).toHaveTextContent(/memory preservation/i);

  await userEvent.click(within(finder).getByRole('radio', { name: 'Gallery view' }));
  expect(finder).toHaveTextContent(/1 of 6|2 of 6/);
  await userEvent.click(within(finder).getByRole('button', { name: 'Next project' }));
  expect(finder).toHaveTextContent(/Maeve, your digital closet/i);
});
