import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

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

test('makes a folder, moves an app off the dock, and puts it back', async () => {
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: 'New Folder' }));
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveTextContent(/this folder is empty/i);
  expect(screen.getByRole('button', { name: 'Open untitled folder' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Delete Folder' }));
  expect(screen.queryByRole('button', { name: 'Open untitled folder' })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Open Notes' }));
  await userEvent.click(screen.getByRole('button', { name: 'Move to the desktop' }));
  const dock = screen.getByRole('toolbar', { name: 'Dock' });
  expect(within(dock).queryByRole('button', { name: 'Open Notes' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open Notes' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Move to the dock' }));
  expect(within(dock).getByRole('button', { name: 'Open Notes' })).toBeInTheDocument();
});

test('shows skills, portfolio links, and the MLH news profile', async () => {
  render(<App />);

  const skills = screen.getByRole('navigation', { name: 'Skills' });
  expect(skills).toHaveTextContent('Python');
  expect(skills).toHaveTextContent('TypeScript');

  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/rachruby');
  expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/rachelzhang24/');
  expect(screen.getByRole('link', { name: 'Devpost' })).toHaveAttribute('href', 'https://devpost.com/rachruby');
  expect(screen.getByRole('img', { name: 'Dev by Ruitong' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Open News' }));
  const news = screen.getByRole('dialog');
  expect(news).toHaveTextContent(/MLH Top 50/i);
  expect(within(news).getByRole('link', { name: 'Open the MLH Top 50 profile' })).toHaveAttribute(
    'href',
    'https://top.mlh.com/2025/profiles/rachel-zhang',
  );
});
