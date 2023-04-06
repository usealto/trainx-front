export const EN = {
  shared: {
    edit: 'Edit',
  },
  leadHome: {
    title: 'Good morning {{}}',
    subtitle: 'Find all the statistics of your teams.',
    comments: ['{{}} comment', '{{}} comments'],
    subtitleComment: ['Your users left {{}} new comment.', 'Your users left {{}} new comments.'],
    question: ['{{}} suggested question', '{{}} suggested questions'],
    subtitleQuestion: ['You have {{}} pending question.', 'You have {{}} pending questions.'],
    statistics: {
      title: 'Statistics',
      tabs: {
        week: 'Week',
        month: 'month',
        year: 'year',
      },
      globalScore: 'Overall score',
      globalScoreToolTip: 'Average score of all questions answered over the given period',
      averageCompletion: 'Average Completion',
      averageCompletionToolTip: 'Number of successful programs out of number of assigned programs',
      activeMembers: 'Active members',
      activeMembersToolTip: 'Number of members who interacted with Alto over a given period',
      inactiveMembers: 'Inactive members',
      inactiveMembersToolTip: 'Number of members who have not interacted with Alto over a given period',
    },
    globalEvolution: {
      title: 'Overall evolution',
      tabs: {
        program: 'Program',
        tag: 'Tags',
        team: 'Crew',
        member: 'Member',
      },
      top: 'top',
      flop: 'flop',
    },
    ongoingPrograms: {
      title: 'Current programs',
      involvement: 'Participation',
      progress: 'Advancement',
      score: 'Score',
    },
    ongoingChallenges: {
      title: 'Current challenges',
      byTeam: 'By team',
      individual: 'Individual',
      noTeamChallenges: 'No team challenge available',
      noTeamChallengesSubtitle: 'Create, or import, your first challenges and assign to teams',
      noIndividualChallenges: 'No individual challenge available',
      table: {
        name: 'Name',
        teams: 'Teams',
        leader: 'Leader',
        end: 'END',
      },
    },
  },
  menu: {
    home: 'Welcome',
    programs: 'Programs',
    team: 'Crew',
    challenges: 'Challenges',
  },
  errors: {
    BadParameters: {
      title: 'Bad parameters feels',
    },
    ApiOff: {
      title: 'Server unreachable',
      message: 'The server is unreachable. ',
    },
    Unauthorized: {
      title: 'Unauthorized',
      message: 'You are not logged in!',
    },
    Notfound: {
      title: 'Item not found',
      message: "We can't find what you are looking for.",
    },
    UserNotFound: {
      title: 'User not found',
      message: 'User is not allowed to connect here. ',
    },
    ServerError: {
      title: 'Server Error',
      message: 'The server encountered an error. ',
    },
    ClientError: {
      title: 'Customer Error',
      message: '',
    },
    BadGateway: {
      title: 'Gateway Error',
      message: '',
    },
    ServiceUnavailable: {
      title: 'Maintenance',
      message: '',
    },
    Timeout: {
      title: 'Timeout',
      message: 'The server took too long to respond. ',
    },
    form: {
      title: 'Form Error',
    },
    msg: {
      tooBig: {
        title: 'Size limit exceeded!',
        message: "This file is too big (> 20 MB) and won't be uploaded: ",
      },
      tooManyFiles: {
        title: 'File limit exceeded!',
        message: 'You have reached the max.  ',
      },
    },
  },
};
