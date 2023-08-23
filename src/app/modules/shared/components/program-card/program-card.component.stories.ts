import { type Meta, type StoryObj } from '@storybook/angular';
import { ProgramCardComponent } from './program-card.component';
import { PriorityEnumApi, ProgramDtoApiPriorityEnumApi } from '@usealto/sdk-ts-angular';

const meta: Meta<ProgramCardComponent> = {
  title: 'Shared/ProgramCard',
  component: ProgramCardComponent,
  tags: ['autodocs'],
  render: (args: ProgramCardComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ProgramCardComponent>;

export const ProgramCard: Story = {
  args: {
    program: {
      isActive: true,
      name: 'programme 1',
      expectation: 90,
      priority: ProgramDtoApiPriorityEnumApi.High,
      showTimer: true,
      teams: [],
      questionsCount: 10,
      company: {
        id: 'company-id',
        name: 'usealto',
        usersHaveWebAccess: true,
      },
      companyId: 'company-id',
      id: 'program-id',
      createdAt: new Date(),
      createdBy: 'user-id',
      createdByUser: {
        id: 'user-id',
        email: 'user@usealto.com',
        firstname: 'firstname',
        lastname: 'lastname',
      },
      updatedAt: new Date(),
    },

    programRun: {
      id: 'programRun-id',
      createdBy: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      finishedAt: new Date(),
      program: {
        id: 'program-id',
        createdBy: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        priority: PriorityEnumApi.High,
        isActive: true,
        name: 'programme 1',
        expectation: 90,
        showTimer: true,
        teams: [],
        assignments: [],
        runs: [],
      },
      programId: 'program-id',
      programExpectation: 90,
      questions: [],
      questionsCount: 10,
      goodGuessesCount: 8,
      guessesCount: 10,
    },
  },
};

export const ProgramCardWithScore: Story = {
  args: {
    score: 0.8,
    program: {
      isActive: true,
      name: 'programme 1',
      expectation: 90,
      priority: ProgramDtoApiPriorityEnumApi.High,
      showTimer: true,
      teams: [],
      questionsCount: 10,
      company: {
        id: 'company-id',
        name: 'usealto',
        usersHaveWebAccess: true,
      },
      companyId: 'company-id',
      id: 'program-id',
      createdAt: new Date(),
      createdBy: 'user-id',
      createdByUser: {
        id: 'user-id',
        email: 'user@usealto.com',
        firstname: 'firstname',
        lastname: 'lastname',
      },
      updatedAt: new Date(),
    },

    programRun: {
      id: 'programRun-id',
      createdBy: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      finishedAt: new Date(),
      program: {
        id: 'program-id',
        createdBy: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        priority: PriorityEnumApi.High,
        isActive: true,
        name: 'programme 1',
        expectation: 90,
        showTimer: true,
        teams: [],
        assignments: [],
        runs: [],
      },
      programId: 'program-id',
      programExpectation: 90,
      questions: [],
      questionsCount: 10,
      goodGuessesCount: 8,
      guessesCount: 10,
    },
  },
};

export const ProgramCardWithProgression: Story = {
  args: {
    progress: 0.9,
    program: {
      isActive: true,
      name: 'programme 1',
      expectation: 90,
      priority: ProgramDtoApiPriorityEnumApi.High,
      showTimer: true,
      teams: [],
      questionsCount: 10,
      company: {
        id: 'company-id',
        name: 'usealto',
        usersHaveWebAccess: true,
      },
      companyId: 'company-id',
      id: 'program-id',
      createdAt: new Date(),
      createdBy: 'user-id',
      createdByUser: {
        id: 'user-id',
        email: 'user@usealto.com',
        firstname: 'firstname',
        lastname: 'lastname',
      },
      updatedAt: new Date(),
    },

    programRun: {
      id: 'programRun-id',
      createdBy: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      finishedAt: new Date(),
      program: {
        id: 'program-id',
        createdBy: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        priority: PriorityEnumApi.High,
        isActive: true,
        name: 'programme 1',
        expectation: 90,
        showTimer: true,
        teams: [],
        assignments: [],
        runs: [],
      },
      programId: 'program-id',
      programExpectation: 90,
      questions: [],
      questionsCount: 10,
      goodGuessesCount: 8,
      guessesCount: 10,
    },
  },
};

export const ProgramCardWithParicipation: Story = {
  args: {
    participation: 1,
    program: {
      isActive: true,
      name: 'programme 1',
      expectation: 90,
      priority: ProgramDtoApiPriorityEnumApi.High,
      showTimer: true,
      teams: [],
      questionsCount: 10,
      company: {
        id: 'company-id',
        name: 'usealto',
        usersHaveWebAccess: true,
      },
      companyId: 'company-id',
      id: 'program-id',
      createdAt: new Date(),
      createdBy: 'user-id',
      createdByUser: {
        id: 'user-id',
        email: 'user@usealto.com',
        firstname: 'firstname',
        lastname: 'lastname',
      },
      updatedAt: new Date(),
    },

    programRun: {
      id: 'programRun-id',
      createdBy: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      finishedAt: new Date(),
      program: {
        id: 'program-id',
        createdBy: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        priority: PriorityEnumApi.High,
        isActive: true,
        name: 'programme 1',
        expectation: 90,
        showTimer: true,
        teams: [],
        assignments: [],
        runs: [],
      },
      programId: 'program-id',
      programExpectation: 90,
      questions: [],
      questionsCount: 10,
      goodGuessesCount: 8,
      guessesCount: 10,
    },
  },
};

export const ProgramCardWithDisplayCard: Story = {
  args: {
    displayToggle: true,
    program: {
      isActive: true,
      name: 'programme 1',
      expectation: 90,
      priority: ProgramDtoApiPriorityEnumApi.High,
      showTimer: true,
      teams: [],
      questionsCount: 10,
      company: {
        id: 'company-id',
        name: 'usealto',
        usersHaveWebAccess: true,
      },
      companyId: 'company-id',
      id: 'program-id',
      createdAt: new Date(),
      createdBy: 'user-id',
      createdByUser: {
        id: 'user-id',
        email: 'user@usealto.com',
        firstname: 'firstname',
        lastname: 'lastname',
      },
      updatedAt: new Date(),
    },

    programRun: {
      id: 'programRun-id',
      createdBy: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      finishedAt: new Date(),
      program: {
        id: 'program-id',
        createdBy: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        priority: PriorityEnumApi.High,
        isActive: true,
        name: 'programme 1',
        expectation: 90,
        showTimer: true,
        teams: [],
        assignments: [],
        runs: [],
      },
      programId: 'program-id',
      programExpectation: 90,
      questions: [],
      questionsCount: 10,
      goodGuessesCount: 8,
      guessesCount: 10,
    },
  },
};
