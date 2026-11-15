import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('opens a work experience app from the island', async () => {
  render(<App />);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /open opentable/i }));

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveTextContent(/AI Engineer Intern/i);
  expect(dialog).toHaveTextContent(/eval gates/i);
  expect(dialog).toHaveTextContent(/Slack bots/i);

  await userEvent.click(screen.getByRole('button', { name: /^close$/i }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
