import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>): React.JSX.Element {
  return <CollapsiblePrimitive.Root {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>): React.JSX.Element {
  return <CollapsiblePrimitive.Trigger {...props} />
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>): React.JSX.Element {
  return <CollapsiblePrimitive.Content {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
