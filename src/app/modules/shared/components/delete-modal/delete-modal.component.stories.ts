import { type Meta, type StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DeleteModalComponent } from './delete-modal.component';
import { SharedModule } from '../../shared.module';

const meta: Meta<DeleteModalComponent> = {
  title: 'Shared/DeleteModal',
  component: DeleteModalComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SharedModule],
    }),
  ],
  render: (args: DeleteModalComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<DeleteModalComponent>;

export const DeleteModal: Story = {
  args: {
    data: {
      title: "Supprimer l'équipe Team1",
      subtitle:
        'Cette équipe contient 10 membres, êtes-vous sûr de vouloir la supprimer ? Cette action est irréversible.',
    },
  },
};
