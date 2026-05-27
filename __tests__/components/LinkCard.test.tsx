import LinkButton from '@/src/components/LinkButton';
import LinkCard from '@/src/components/LinkCard';
import SVGBarista from '@/src/components/SVG/SVGBarista';
import { render } from '@testing-library/react-native';

/**
 * LinkCard component test
 */
describe('<LinkCard />', () => {
  test('The loader is rendering the correct text', () => {
    const { getByText } = render(<LinkCard
      title="Testing title"
      description="Testing description"
      screen="Testing screen"
      linkText="Testing link text"
      SVGElement={<SVGBarista />}
    />);

    /**
     * Rendered by LinkCard
     */
    getByText('Testing title');
    getByText('Testing description');
  });
});

/**
 * Mock factory
 * Make sure the LinkCard rendered a LinkButton. That's what it do.
 * If it didn't then why are we using LinkCard?
 */
jest.mock('@/src/components/LinkButton', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(({ children }: { children: string }) => {
    return <Text>{children}</Text>;
  });
});

const mockLinkButton = jest.mocked(LinkButton);

/**
 * Test whether our props are getting passed to LinkButton
 */
render(
  <LinkCard
    title="Testing title"
    description="Testing description"
    screen="Testing screen"
    linkText="Testing link text"
    SVGElement={<SVGBarista />}
  />
);

expect(mockLinkButton).toHaveBeenCalledWith(
  expect.objectContaining({
    screen: 'Testing screen',
    params: { href: '/' },
    children: 'Testing link text',
  }),
  undefined,
);