import type { Meta, StoryObj } from '@storybook/react-vite'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Components/UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue='account' className='w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='account'>Account</TabsTrigger>
        <TabsTrigger value='password'>Password</TabsTrigger>
      </TabsList>
      <TabsContent value='account' className='space-y-2'>
        <div className='space-y-1'>
          <h3 className='text-sm font-medium'>Account</h3>
          <p className='text-sm text-muted-foreground'>
            Make changes to your account here. Click save when you're done.
          </p>
        </div>
        <div className='space-y-2'>
          <div>
            <label className='text-sm font-medium'>Name</label>
            <input
              type='text'
              className='w-full px-3 py-2 text-sm border rounded-md'
              placeholder='Your name'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Username</label>
            <input
              type='text'
              className='w-full px-3 py-2 text-sm border rounded-md'
              placeholder='@username'
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value='password' className='space-y-2'>
        <div className='space-y-1'>
          <h3 className='text-sm font-medium'>Password</h3>
          <p className='text-sm text-muted-foreground'>
            Change your password here. After saving, you'll be logged out.
          </p>
        </div>
        <div className='space-y-2'>
          <div>
            <label className='text-sm font-medium'>Current password</label>
            <input type='password' className='w-full px-3 py-2 text-sm border rounded-md' />
          </div>
          <div>
            <label className='text-sm font-medium'>New password</label>
            <input type='password' className='w-full px-3 py-2 text-sm border rounded-md' />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

export const WithThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue='overview' className='w-[500px]'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='overview'>Overview</TabsTrigger>
        <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        <TabsTrigger value='reports'>Reports</TabsTrigger>
      </TabsList>
      <TabsContent value='overview'>
        <div className='p-4 border rounded-lg'>
          <h3 className='text-lg font-semibold'>Overview</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            This is the overview tab content. Here you can see a general summary.
          </p>
        </div>
      </TabsContent>
      <TabsContent value='analytics'>
        <div className='p-4 border rounded-lg'>
          <h3 className='text-lg font-semibold'>Analytics</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            Analytics data and charts would be displayed here.
          </p>
        </div>
      </TabsContent>
      <TabsContent value='reports'>
        <div className='p-4 border rounded-lg'>
          <h3 className='text-lg font-semibold'>Reports</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            Detailed reports and downloadable content.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

export const Simple: Story = {
  render: () => (
    <Tabs defaultValue='tab1' className='w-[300px]'>
      <TabsList>
        <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value='tab1'>
        <p>Content for the first tab.</p>
      </TabsContent>
      <TabsContent value='tab2'>
        <p>Content for the second tab.</p>
      </TabsContent>
    </Tabs>
  ),
}
