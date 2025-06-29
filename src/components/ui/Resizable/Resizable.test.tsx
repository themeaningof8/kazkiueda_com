import { render, screen } from '@testing-library/react'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './Resizable'

describe('Resizable', () => {
  it('renders resizable panel group with panels', () => {
    render(
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={50}>
          <div>Panel 1</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div>Panel 2</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )

    expect(screen.getByText('Panel 1')).toBeInTheDocument()
    expect(screen.getByText('Panel 2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <ResizablePanelGroup
        direction='horizontal'
        className='custom-panel-group'
        data-testid='panel-group'
      >
        <ResizablePanel defaultSize={50}>
          <div>Content</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )

    const panelGroup = screen.getByTestId('panel-group')
    expect(panelGroup).toHaveClass('custom-panel-group')
  })

  it('supports vertical direction', () => {
    render(
      <ResizablePanelGroup direction='vertical' data-testid='panel-group'>
        <ResizablePanel defaultSize={50}>
          <div>Panel 1</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div>Panel 2</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )

    const panelGroup = screen.getByTestId('panel-group')
    expect(panelGroup).toHaveAttribute('data-panel-group-direction', 'vertical')
  })

  it('renders handle between panels', () => {
    render(
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={50}>
          <div>Panel 1</div>
        </ResizablePanel>
        <ResizableHandle data-testid='resize-handle' />
        <ResizablePanel defaultSize={50}>
          <div>Panel 2</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )

    const handle = screen.getByTestId('resize-handle')
    expect(handle).toBeInTheDocument()
  })
})
