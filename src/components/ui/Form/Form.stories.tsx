import { zodResolver } from '@hookform/resolvers/zod'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import React from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '../Button'
import { Input } from '../Input'
import { Textarea } from '../Textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './Form'

const meta = {
  title: 'Components/UI/Form',
  component: FormItem, // Use FormItem instead of Form since Form is a provider
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormItem>

export default meta
type Story = StoryObj<typeof meta>

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'ユーザー名は2文字以上で入力してください。',
  }),
  email: z.string().email({
    message: '有効なメールアドレスを入力してください。',
  }),
  bio: z
    .string()
    .max(160, {
      message: '自己紹介は160文字以内で入力してください。',
    })
    .optional(),
})

export const Default: Story = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        email: '',
        bio: '',
      },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values)
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-96 space-y-6'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>ユーザー名</FormLabel>
                <FormControl>
                  <Input placeholder='ユーザー名を入力' {...field} />
                </FormControl>
                <FormDescription>これはあなたの公開表示名です。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='mail@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>自己紹介</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='あなたについて教えてください'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormDescription>160文字以内で自己紹介を書いてください。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>送信</Button>
        </form>
      </Form>
    )
  },
}

export const WithErrors: Story = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: 'a', // Too short to trigger validation error
        email: 'invalid-email', // Invalid email to trigger validation error
        bio: '',
      },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values)
    }

    // Trigger validation to show errors
    React.useEffect(() => {
      form.trigger()
    }, [form])

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-96 space-y-6'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>ユーザー名</FormLabel>
                <FormControl>
                  <Input placeholder='ユーザー名を入力' {...field} />
                </FormControl>
                <FormDescription>これはあなたの公開表示名です。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='mail@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>送信</Button>
        </form>
      </Form>
    )
  },
}
