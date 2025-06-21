import type { Meta, StoryObj } from '@storybook/react'
import { Settings } from 'lucide-react'

import { Button } from '../Button'
import { Input } from '../Input'
import { Label } from '../Label'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'

const meta = {
  title: 'Components/UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='grid gap-4'>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>Dimensions</h4>
            <p className='text-sm text-muted-foreground'>Set the dimensions for the layer.</p>
          </div>
          <div className='grid gap-2'>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='width'>Width</Label>
              <Input id='width' defaultValue='100%' className='col-span-2 h-8' />
            </div>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='maxWidth'>Max. width</Label>
              <Input id='maxWidth' defaultValue='300px' className='col-span-2 h-8' />
            </div>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='height'>Height</Label>
              <Input id='height' defaultValue='25px' className='col-span-2 h-8' />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon'>
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className='space-y-2'>
          <h4 className='font-medium leading-none'>Settings</h4>
          <p className='text-sm text-muted-foreground'>Configure your preferences.</p>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const Simple: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Click me</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>This is a simple popover content.</p>
      </PopoverContent>
    </Popover>
  ),
}
