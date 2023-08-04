import { type Meta, type StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { QuestionDeleteModalComponent } from './question-delete-modal.component';
import { SharedModule } from '../../shared.module';
import { QuestionDtoApiAnswerTypeEnumApi, QuestionDtoApiTypeEnumApi } from '@usealto/sdk-ts-angular';

const meta: Meta<QuestionDeleteModalComponent> = {
  title: 'Shared/QuestionDeleteModal',
  component: QuestionDeleteModalComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SharedModule],
    }),
  ],
  render: (args: QuestionDeleteModalComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<QuestionDeleteModalComponent>;

export const QuestionDeleteModal: Story = {
  args: {
    question: {
      title: "Ou se situe le siège de l'entreprise UseAlto ?",
      type: QuestionDtoApiTypeEnumApi.MultipleChoice,
      answerType: QuestionDtoApiAnswerTypeEnumApi.Number,
      answersAccepted: ['1', '2', '3'],
      answersWrong: ['4', '5', '6'],
      company: { id: 'id-company', name: 'usealto', usersHaveWebAccess: true },
      companyId: 'id-company',
      id: 'id-question',
      createdAt: new Date(),
      createdBy: 'id-user',
      createdByUser: {
        id: 'id-user',
        email: 'user@usealto.com',
        firstname: 'firstname',
        lastname: 'lastname',
      },
      updatedAt: new Date(),
      programs: [],
      tags: [],
    },
  },
};
