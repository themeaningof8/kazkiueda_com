import type { Meta, StoryObj } from '@storybook/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className='bg-blue-500 text-white px-4 py-2 rounded'>
        Open Dialog
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <label htmlFor='name' className='text-right'>
              Name
            </label>
            <input
              id='name'
              defaultValue='Pedro Duarte'
              className='col-span-3 px-3 py-2 border rounded'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <label htmlFor='username' className='text-right'>
              Username
            </label>
            <input
              id='username'
              defaultValue='@peduarte'
              className='col-span-3 px-3 py-2 border rounded'
            />
          </div>
        </div>
        <DialogFooter>
          <button className='bg-blue-500 text-white px-4 py-2 rounded'>Save changes</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className='bg-green-500 text-white px-4 py-2 rounded'>
        Open Dialog
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Confirmation Required</DialogTitle>
          <DialogDescription>
            Please confirm your action by clicking one of the buttons below.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button className='bg-gray-500 text-white px-4 py-2 rounded mr-2'>Cancel</button>
          <button className='bg-red-500 text-white px-4 py-2 rounded'>Confirm</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Simple: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className='bg-purple-500 text-white px-4 py-2 rounded'>About</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About This Application</DialogTitle>
          <DialogDescription>
            This is a simple dialog example built with Radix UI primitives and Tailwind CSS.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
}
