import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarIcon, MailIcon, SearchIcon, SettingsIcon, UserIcon } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './Command'

const meta = {
  title: 'Components/UI/Command',
  component: Command,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Command className='rounded-lg border shadow-md md:min-w-[450px]'>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading='Suggestions'>
          <CommandItem>
            <CalendarIcon />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <SearchIcon />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <MailIcon />
            <span>Launch Email</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Settings'>
          <CommandItem>
            <UserIcon />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SettingsIcon />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const WithoutIcons: Story = {
  render: () => (
    <Command className='rounded-lg border shadow-md md:min-w-[450px]'>
      <CommandInput placeholder='Search...' />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading='Suggestions'>
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Launch Email</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Settings'>
          <CommandItem>
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const EmptyState: Story = {
  render: () => (
    <Command className='rounded-lg border shadow-md md:min-w-[450px]'>
      <CommandInput placeholder='Search for something that does not exist...' />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
      </CommandList>
    </Command>
  ),
}

export const Minimal: Story = {
  render: () => (
    <Command className='rounded-lg border shadow-md'>
      <CommandInput placeholder='Quick search...' />
      <CommandList>
        <CommandGroup>
          <CommandItem>Home</CommandItem>
          <CommandItem>About</CommandItem>
          <CommandItem>Contact</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}
