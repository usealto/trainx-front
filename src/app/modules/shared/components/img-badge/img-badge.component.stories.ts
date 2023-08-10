import { type Meta, type StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ImgBadgeComponent } from './img-badge.component';
import { SharedModule } from '../../shared.module';

const meta: Meta<ImgBadgeComponent> = {
  title: 'Shared/ImgBadge',
  component: ImgBadgeComponent,
  tags: ['autodocs'],
  render: (args: ImgBadgeComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ImgBadgeComponent>;

export const ImgBadge: Story = {
  args: {
    url: 'https://st2.depositphotos.com/5471768/10029/v/450/depositphotos_100296568-stock-illustration-super-hero-red-mask-for.jpg',
  },
};

export const ImgBadgeWithUser: Story = {
  args: {
    user: {
      id: 'id-user',
      email: 'test@usealto.com',
      pictureUrl:
        'https://thumbs.dreamstime.com/b/avatar-joueur-de-football-contour-ic%C3%B4ne-en-couleur-signes-et-symboles-peuvent-%C3%AAtre-utilis%C3%A9s-pour-le-logo-web-application-mobile-220344599.jpg',
      firstname: 'firstaname',
      lastname: 'lastname',
    },
  },
};

export const ImgBadgeSizing: Story = {
  args: {
    url: 'https://st2.depositphotos.com/5471768/10029/v/450/depositphotos_100296568-stock-illustration-super-hero-red-mask-for.jpg',
    size: 100
  },
};

export const ImgBadgeBordered: Story = {
  args: {
    url: 'https://st2.depositphotos.com/5471768/10029/v/450/depositphotos_100296568-stock-illustration-super-hero-red-mask-for.jpg',
    hasBorder: true
  },
};

export const ImgBadgeWithoutToogle: Story = {
  args: {
    user: {
      id: 'id-user',
      email: 'test@usealto.com',
      pictureUrl:
        'https://thumbs.dreamstime.com/b/avatar-joueur-de-football-contour-ic%C3%B4ne-en-couleur-signes-et-symboles-peuvent-%C3%AAtre-utilis%C3%A9s-pour-le-logo-web-application-mobile-220344599.jpg',
      firstname: 'firstaname',
      lastname: 'lastname',
    },
    toggleTooltip: false,
  },
};

