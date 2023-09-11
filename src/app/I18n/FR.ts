export const FR = {
  shared: {
    smiley: '👍',
    edit: 'Modifier',
    save: 'Enregistrer',
    submit: 'Valider',
    next: 'Suivant',
    previous: 'Précédent',
    cancel: 'Annuler',
    delete: 'Supprimer',
    create: 'Créer',
    refuse: 'Refuser',
    share: 'Partager',
    clipboard: 'Copier dans le presse-papier',
    showMore: 'Voir plus',
    showAll: 'Tout voir',
    minutes: 'minutes',
    seconds: 'secondes',
    noTeam: "Pas d'équipes pour l'instant.",
    optional: '(facultatif)',
    noData: 'Aucun résultat ne correspond à votre recherche.',
    noDataSubtitle: 'Essayez avec d’autres filtres.',
    resetFilters: 'Réinitialiser les filtres',
    reply: 'Répondre',
    search: 'Rechercher',
    textNotFound: 'Aucun résultat',
    period: 'Période',
    soon: 'Bientôt',
    tag: 'tag',
    program: 'programme',
    tags: 'tags',
    programs: 'programmes',
    teams: 'équipes',
    members: 'membres',
    top: 'Top',
    flop: 'Flop',
    waitingForNewResults: "Dans l'attente de nouveaux résultats.",
    days: ['jour', 'jours'],
    imageBadge: {
      userFinished: ['Devenez le premier à terminer', 'a terminé', 'ont terminé'],
    },
    pagination: {
      on: 'sur',
    },
    priorities: {
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
    },
    status: {
      title: 'Status',
      incoming: 'À venir',
      ongoing: 'En cours',
      ended: 'Terminé',
    },
    dateFilter: {
      week: 'Semaine',
      month: 'Mois',
      trimester: '3 Mois',
      year: 'Année',
    },
    rollingDateFilter: {
      year: '12 mois',
      trimester: '3 mois',
      month: '1 mois',
    },
    noWebAccess: {
      title: 'Félicitations ! Votre compte Alto est actif',
      subtitle:
        "Comme souhaité par vos collaborateurs, vous profiterez bientôt d'Alto directement dans vos outils préférés tels que Slack ou Teams",
      goodbye: 'À bientôt !',
    },
    noCompany: {
      title: "Oops ! Nous n'avons pas trouvé votre entreprise.",
      subtitle:
        'Une erreur s’est produite. Contactez-nous et nous ferons notre maximum pour régler la situation.',
      button: 'Envoyer un mail à Alto',
    },
    noTeams: {
      title: 'Oops ! Vous n’êtes assigné(e) à aucune équipe.',
      subtitle: 'S’il s’agit d’une erreur, informez-en votre administrateur directement.',
      button: 'Envoyer un mail à mon administrateur',
    },
  },
  leadHome: {
    title: 'Bonjour ',
    subtitle: "Retrouvez une vue d'ensemble sur votre training.",
    comments: ['Aucun commentaire', '{{}} commentaire', '{{}} commentaires'],
    awaiting: 'en attente',
    subtitleComment: [
      'Vous avez traité toutes les commentaires écrits par vos collaborateurs.',
      'Consultez les commentaires écrits par vos collaborateurs.',
      'Consultez les commentaires écrits par vos collaborateurs.',
    ],
    question: ['Aucune question suggérée', '{{}} question suggérée', '{{}} questions suggérées'],
    subtitleQuestion: [
      'Vous avez traité toutes les questions suggérées par vos collaborateurs.',
      'Consultez les questions suggérées écrites par vos collaborateurs.',
      'Consultez les questions suggérées écrites par vos collaborateurs.',
    ],
    statistics: {
      title: 'Les statistiques de vos équipes',
      subtitle: 'Découvrez un aperçu des performances de vos équipes.',
      averageScore: 'Score moyen',
      terminatedPrograms: 'Programmes terminés',
      guessesCount: 'Nombre total de réponses ',
      placeholder: 'C’est le moment d’amorcer la montée en compétences de vos équipes !',
    },
    graph: {
      period: 'Période',
      score: 'Score (%)',
      tagFilter: 'Tags',
      placeholder:
        'Embarquez vos équipes dans un programme pour commencer à les entraîner et à les évaluer !',
    },
    globalEvolution: {
      title: 'Évolution globale',
      score: 'Score moyen de vos équipes',
      chartSubtitle: 'Évolution du score moyen de vos équipes dans le temps.',
      tabs: {
        program: 'Programmes',
        tag: 'Tags',
        team: 'Équipe',
        member: 'Membre',
      },
    },
    topFlop: {
      teams: {
        title: 'Niveau de connaissance de vos équipes',
        subtitle: 'Aperçu du niveau de maîtrise de vos équipes par thématiques.',
        placeholder: 'Envie de découvrir le niveau de connaissance de vos équipes ?',
      },
      users: {
        title: 'Niveau de connaissance de vos collaborateurs',
        subtitle: 'Aperçu du niveau de maîtrise de vos collaborateurs.',
        placeholder: 'Envie de découvrir le niveau de connaissance de vos collaborateurs ?',
      },
    },
    ongoingPrograms: {
      title: 'Programmes en cours',
      subtitle: 'Retrouvez les programmes que vos équipes sont en train de réaliser.',
      involvement: 'Participation',
      progress: 'Avancement',
      noData: 'Aucun programme en cours',
      noDataSubtitle:
        'Créez votre premier programme et assignez le à vos équipes en quelques minutes seulement',
      score: 'Score',
      cardPlaceholder: 'Motivez vos équipes à réaliser des programmes !',
      placeholder:
        'Construisez votre premier programme pour commencer à entraîner et à évaluer vos équipes !',
    },
    ongoingChallenges: {
      title: 'Challenges en cours',
      byTeam: 'Par équipe',
      individual: 'Individuel',
      noTeamChallenges: 'Aucun challenge par équipe disponible',
      noTeamChallengesSubtitle: 'Créez, ou importez, vos premiers challenges et assignez à des équipes',
      noIndividualChallenges: 'Aucun challenge individuel disponible',
      noIndividualChallengesSubtitle: 'Créez, ou importez, vos premiers challenges',
      table: {
        name: 'Nom',
        teams: 'Équipes en compétition',
        leader: 'Leader',
        startDate: 'Date de début',
        endDate: 'Date de fin',
        end: 'Fin',
        status: 'Status',
      },
    },
  },
  programs: {
    titleIcon: '🎯',
    title: 'Programmes',
    subtitle: 'Retrouvez l’ensemble des programmes assignés à vos équipes.',
    activePrograms: {
      titleIcon: '🎯',
      title: 'Programmes en cours',
      subtitle: 'Retrouvez les programmes que vos équipes sont en train de réaliser.',
      placeholderTitle: 'Vos équipes n’ont pas encore entamé leur montée en compétences.',
      placeholderSubtitle: 'Commencez à créer des programmes pour les motiver !',
    },
    programs: {
      title: 'Programmes de vos équipes',
      subtitle: 'Retrouvez l’ensemble des programmes assignés à vos équipes.',
      createProgram: 'Créer un programme',
      involvement: 'Taux de participation',
      involvementToolTip: 'Nombre de membres ayant commencé le programme sur le nombre de membres assignés',
      progress: 'Avancement',
      progressToolTip: 'Nombre de questions répondues par tout les membres sur le nombre total de questions',
      score: 'Score',
      membersHaveValidated: 'membres ayant validé',
      scoreToolTip: 'Score moyen du programme depuis sa création',
      teams: 'Équipes:',
      filters: {
        team: 'Équipe',
        teams: 'Équipes',
        score: 'Score',
        progression: 'Avancement',
      },
      placeholderTitle: 'Aucun résultat ne correspond aux filtres sélectionnés.',
      placeholderSubtitle: 'Essayez avec d’autres filtres.',
    },
    questions: {
      title: 'Questions de vos programmes',
      subtitle: "Retrouvez l'ensemble des questions de votre organisation.",
      createQuestion: 'Créer une question',

      placeholder: {
        noData: 'Aucun résultat correspondant',
        noQuestion: 'Aucune question disponible',
        noDataSubtitle:
          "Votre recherche n'a donné aucun résultat, essayez une autre formulation ou d'autres filtres.",
        noQuestionSubtitle:
          'Créez, ou importez, vos premières questions et assignez à des programmes ou des tags existants.',
        createQuestionPlaceholder: 'Créer une question',
        importQuestionPlaceholder: 'Importer des questions',
      },
      table: {
        question: 'Intitulé',
        score: 'Score moyen',
        author: 'Ajoutée par',
        tags: 'Tags',
        programs: 'Programmes',
        placeholder: 'Créez vos premières questions pour challenger vos équipes !',
      },
      filters: {
        programs: 'Programmes',
        tags: 'Tags',
        contributors: 'Contributeurs',
      },
    },
    awaitQuestions: {
      title: 'Questions en attente',
      subtitle: 'Ces questions ont été suggérées par vos utilisateurs et attendent votre validation.',
      table: {
        question: 'Intitulé',
        author: 'Ajouté par',
      },
      form: {
        title: 'Suggérer une question',
        subtitle: 'Pour le programme',
        label: 'Question',
        placeholder: 'Intitulé de la question',
      },
    },
    tags: {
      title: 'Tags',
      subtitle: "Retrouvez l'ensemble des tags de votre organisation.",
      createTag: 'Créer un tag',
      table: {
        name: 'Nom du tag',
        score: 'Score moyen de vos équipes',
        associatedQuestions: 'Nombre de questions associées',
        questions: ' questions',
        placeholder: 'Créez vos premiers tags pour cibler les axes d’amélioration de vos équipes !',
      },
    },
    forms: {
      create: 'Créer un programme',
      edit: 'Éditer un programme',
      questionCount: 'Nombre de questions',
      step1: {
        title: 'Informations',
        subtitle: 'Informations générales du programme.',
        name: 'Nom du programme',
        nameSubtitle: 'Visible par tout le monde.',
        namePlaceholder: 'Exemple: Onboarding',
        description: 'Description',
        descriptionSubtitle: 'Ecrivez une brève description du contenu du programme',
        descriptionPlaceholder:
          "Le programme d'onboarding vise à entraîner les nouveaux arrivants avec les notions fondamentales à connaître au sein de l'entreprise.",
        tags: 'Tags',
        tagsSubtitle: 'Ciblez les sujets abordés dans le programme.',
        tagsPlaceholder: 'Rechercher dans vos tags',
        teams: 'Équipes',
        teamsSubtitle: 'Assignez les équipes concernées par ce programme.',
        teamsPlaceholder: 'Rechercher dans vos équipes',
        priority: 'Priorité',
        prioritySubtitle: "Déterminez l'importance du programme en associant un niveau de priorité.",
        priorityPlaceholder: 'Choisir un niveau',
        expectation: 'Score attendu',
        expectationSubtitle: 'Déterminez le score que vos équipes sont censées atteindre à ce programme.',
      },
      step2: {
        title: 'Questions',
        subtitle:
          'Questions qui seront présentes dans le programme et auxquelles vos collaborateurs devront répondre.',
        new: 'Créer une nouvelle question',
        newSubtitle: "Aucune question n'a été ajoutée pour l'instant. Vous pouvez :",
        or: 'OU',
        associatedQuestions: {
          title: 'Questions ajoutées au programme',
          subtitle: 'Retrouvez ici les questions que vous venez de créer.',
        },
        existing: {
          title: 'Choisir des questions à associer à ce programme :',
          subtitle:
            'Retrouvez ici les questions associées aux tags sélectionnés dans la partie “Informations”.',
        },
        existing2: {
          title: 'Questions pouvant être ajoutées au programme',
          subtitle:
            'Retrouvez ici les questions associées aux tags sélectionnés dans la partie “Informations”.',
        },
      },
      step3: {
        title: 'Récapitulatif',
        title2: 'Récapitulatif du programme',
        subtitle:
          'Récapitulatif des informations essentielles du programme avant de le partager à vos équipes.',
        summary: 'Récapitulatif',
        summarySubtitle: 'Les informations que vous avez remplies à propos de ce programme.',
      },
    },
    delete: {
      btn: 'Supprimer le programme',
      title: 'Supprimer le programme "{{}}"',
      subtitle:
        'Ce programme est assigné à {{}} équipes, êtes-vous sûrs de vouloir le supprimer ? Cette action est irreversible.',
    },
  },
  statistics: {
    title: 'Statistiques',
    subtitle: "Retrouvez l'ensemble des statistiques de vos équipes.",
    globalEngagement: {
      title: 'Engagement global',
      subtitle: "Retrouvez l'engagement global de vos équipes.",
      activity: {
        activity: 'Activité',
        activitySubtitle: "Suivez l'évolution du nombre de questions auxquelles répondent vos équipes.",
        teamFilter: 'Équipe',
      },
      contributon: {
        contribution: 'Contribution',
        contributionSubtitle: 'Retrouver les équipes ayant suggéré ou commenté des questions.',
      },
    },
    globalPerformance: {
      navbarTitle: 'Performance globale',
      perTeamPerformance: {
        title: 'Performance par équipes',
        subtitle: "Retrouvez une vue d' ensemble sur les résultats de vos équipes.",
        teamFilter: 'Équipes',
        scoreEvolution: {
          title: 'Évolution du score de vos équipes',
          subtitle: 'Evolution du niveau de maitrise global de vos équipes par tags/programmes',
          placeholderTitle: 'Aucune donnée à afficher pour le moment',
          placeholderSubtitle: 'Les équipes s’activent pour fournir les premiers résultats !',
        },
        leaderboard: {
          title: 'Leaderboard',
          subtitle: 'Aperçu du niveau de maîtrise de vos équipes.',
          top: 'Top',
          flop: 'Flop',
          placeholder: 'Motivez vos équipes à réaliser des programmes !',
        },
      },
      perThemePerformance: {
        title: 'Performance par thèmatiques',
        subtitle: "Retrouvez une vue d'ensemble sur les résultats de vos équipes selon leurs thématiques.",
        filters: {
          tags: 'Tags',
        },
        scoreEvolutionChart: {
          title: 'Évolution du niveau de maîtrise',
          subtitle: 'Évolution du score moyen de vos équipes par tag.',
          placeholderTitle: 'Les équipes sont en train de s’échauffer',
          placeholderSubtitle: 'Les premiers résultats ne devraient plus tarder !',
        },
        control: {
          title: 'Niveau de maîtrise des thématiques',
          subtitle: 'Aperçu du niveau global de maîtrise des thématiques.',
          placeholder: 'Vous pourrez bientôt passer au peigne fin toutes les thématiques',
        },
        nav: {
          tags: 'Tags',
          programs: 'Programmes',
        },
      },
      teamsTable: {
        title: 'Vos équipes',
        subtitle: "Découvrez les scores moyens et les axes d'amélioration par équipe.",
        placeholder: 'Envie de lever le voile sur la face cachée de vos équipes ?',
        columns: {
          team: 'Équipe',
          globalScore: 'Score global',
          lessMasteredPrograms: 'Programmes les moins maitrîsés',
          lessMasteredTags: 'Tags les moins maitrîsés',
          scoreEvolution: 'Évolution du score',
        },
      },
      questionsTable: {
        title: 'Questions',
        subtitle: 'Découvrez les scores moyens de vos équipes par question.',
        placeholder: 'Certaines questions peuvent s’avérer plus piquantes que d’autres...',
        columns: {
          question: 'Intitulé de la question',
          globalScore: 'Score global',
          scoreEvolution: 'Évolution du score',
          usersNumber: "Nombre d'utilisateurs ayant répondu",
          badTeams: 'Équipes en difficulté',
        },
      },
    },
    perTeams: {
      title: 'Par équipe',
      globalTooltip:
        '% de questions justes sur le nombre de questions répondues et variation sur la période passée',
    },
  },
  questions: {
    form: {
      title: {
        create: 'Créer une question',
        edit: 'Modifier une question',
        submitted: 'Question suggérée',
      },
      subtitle: {
        question: 'Indiquer l’intitulé, les réponses possibles et les informations complémentaires.',
        submitted:
          " a suggéré une question. Vous pouvez choisir de la rejeter, la valider en l'état ou d'apporter des modifications et informations complémentaires.",
      },
      name: 'Intitulé de la question',
      namePlaceholder: 'Exemple : Quel est notre principal concurrent sur le marché des PMEs ?',
      goodAnswer: 'Bonne(s) réponse(s)',
      addGoodAnswer: 'Ajouter une autre bonne réponse',
      goodAnswerPlaceholder: 'Écrire une bonne réponse',
      badAnswerPlaceholder: 'Écrire une mauvaise réponse',
      badAnswer: 'Mauvaise(s) réponse(s)',
      badAnswerSubtitle: 'Minimum 1 mauvaise réponse.',
      addBadAnswer: 'Ajouter une autre mauvaise réponse',
      programs: 'Programmes',
      programsPlaceholder: 'Sélectionner le(s) programme(s) associé(s) à la question',
      tags: 'Tags',
      tagsPlaceholder: 'Sélectionner les tags associés à la question',
      explanation: 'Brève explication',
      explanationPlaceholder:
        'Exemple: Connaître notre principal concurrent sur le marché des PMEs est primordial pour mieux convaincre les prospects en mettant les forces de notre entreprise en avant.',
      link: 'Lien utile',
      linkPlaceholder: 'Lien vers une ressource utile',
      remainingCharacters: 'caractères restants',
      createSuccess: 'La question a bien été ajoutée',
      editSuccess: 'La question a bien été modifiée',
    },
    deleteModal: {
      title: 'Supprimer la question "{{}}"',
      subtitle: 'Cette question est associée à {{}} programmes et {{}} tags.',
      subtitle2: ' Êtes-vous sûr de vouloir la supprimer ? Cette action est irréversible.',
    },
  },
  tags: {
    form: {
      title: {
        create: 'Créer un tag',
        edit: 'Modifier un tag',
      },
      subtitle:
        "Indiquer le nom de votre nouveau tag ainsi que les programmes et questions auxquels vous souhaitez l'associer.",
      tagName: 'Nom du tag',
      tagNamePlaceholder: 'Exemple: Règlement Général de Protection des Données (RGPD)',
      programs: 'Programmes',
      programsPlaceholder: 'Rechercher dans vos programmes',
      questions: 'Questions',
      questionsPlaceholder: 'Rechercher dans vos questions',
      description: 'Description',
      successCreate: 'Le nouveau tag a bien été ajouté',
      successEdit: 'Le tag a bien été modifié',
    },
    deleteModal: {
      title: 'Supprimer le tag "{{}}"',
      subtitle:
        'Ce tag est associé à {{}} questions. Êtes-vous sûrs de vouloir le supprimer ? Cette action est irreversible.',
    },
  },
  leadTeam: {
    title: 'Équipes et membres',
    subtitle: "Retrouvez une vue d'ensemble sur vos membres.",
    createTeam: 'Créer une équipe',
    members: {
      title: 'Vos membres',
      shortTitle: 'Membres',
      subtitle: 'Retrouvez l’ensemble des utilisateurs de votre entreprise.',
      invite: 'Inviter',
      filters: {
        activity: 'Activité',
        teams: 'Équipe',
        score: 'Score',
      },
      statistics: {
        total: 'Nombre d’utilisateurs',
        totalTooltip: 'Nombre total de membres de votre entreprise',
        regularMembersTooltip: 'Nombre de membres ayant répondu à plus de 50% des questions envoyées',
        iregularMembersTooltip: 'Nombre de membres ayant répondu à moins de 50% des questions envoyées',
        active: 'Membres réguliers',
        inactive: 'Membres irréguliers',
        totalAnswers: 'Nombre total de réponses',
      },
      table: {
        name: 'Nom',
        team: 'Équipe',
        averageScore: 'Score moyen (30 derniers jours)',
        noScore: 'Aucun score',
        averageScoreTooltip: 'Score moyen sur les 30 derniers jours',
        questionsPerMonth: 'Questions (30 derniers jours)',
        questionsPerMonthTooltip:
          'Nombre de questions répondues sur les 30 derniers jours et variation sur la dernière période',
        active: 'Actif',
        inactive: 'Inactif',
        placeholderTitle: 'Aucun utilisateur n’existe dans votre entreprise.',
        placeholderSubtitle: 'Créez vos premiers utilisateurs pour amorcer leur montée en compétences !',
      },
      forms: {
        edition: {
          editAdmin: 'Modifier un administrateur',
          editUser: 'Modifier un utilisateur',
          team: 'Équipe',
          teamsPlaceholder: 'Rechercher dans vos équipes',
          type: "Type d'utilisateur",
          standardType: 'Utilisateur standard',
          adminType: 'Administrateur',
          adminSubtitle:
            'Les administrateurs peuvent créer des programmes, des challenges et ont accès à des statistiques détaillées sur les résultats des équipes.',
          userSubtitle:
            'Les utilisateurs standards peuvent participer aux programmes, suggérer des questions et ont accès à des statistiques détaillées sur leurs résultats seulement.',
          validate: 'Valider',
        },
      },
    },
    teams: {
      title: 'Vos équipes',
      shortTitle: 'Équipes',
      subtitle: "Retrouvez l'ensemble des équipes de votre entreprise.",
      failEdit:
        'Une équipe portant le même nom existe déjà. Veuillez choisir un autre nom pour modifier votre équipe.',
      failCreate:
        'Une équipe portant le même nom existe déjà. Veuillez choisir un autre nom pour votre nouvelle équipe.',
      table: {
        name: "Nom de l'équipe",
        initials: '',
        usersCount: 'Nombre de membres',
        noUsers: 'Aucun membre',
        users: ['Aucun', '{{}}', '{{}}'],
        averageScore: 'Score moyen (30 derniers jours)',
        activity: 'Activité  moyenne (30 derniers jours)',
        noScore: 'Aucun score',
        averageScoreTooltip: 'Score moyen sur les 30 derniers jours',
        creationDate: 'Date de création',
        noActivity: 'Aucune activité',
        placeholderTitle: 'Aucune équipe n’a été créée pour l’instant. ',
        placeholderSubtitle: 'Créez votre première équipe pour commencer à les entraîner !',
      },
      form: {
        title: {
          create: 'Créer une équipe',
          edit: 'Modifier une équipe',
        },
        subtitle: 'Donner un nom à votre équipe',
        longName: 'Nom (version longue)',
        longNamePlaceholder: 'Exemple : Sales Development Representative',
        shortName: 'Nom (version abrégée)',
        shortNamePlaceholder: 'Exemple : SDR',
        invitationEmails: 'Invitation par mail',
        invitationEmailsPlaceholder: 'Séparer les emails par une virgule',
        invitationEmailsSubtitle:
          "Vos collaborateurs recevront une invitation par mail pour s'inscrire à Alto.",
        Programs: 'Programmes',
        programsPlaceholder: 'Sélectionner les programmes assignés à cette équipe',
      },
      deleteModal: {
        title: 'Supprimer l\'équipe "{{}}"',
        subtitle:
          'Cette équipe contient {{}} membres, êtes-vous sûr de vouloir la supprimer ? Cette action est irréversible.',
      },
    },
  },
  challenges: {
    title: 'Challenges',
    subtitle: "Retrouvez l'ensemble des challenges de vos équipes.",
    team: {
      title: 'Challenges par équipe',
      shortTitle: 'Par équipes',
      subtitle: "Retrouvez l'ensemble des challenges assignés à vos équipes.",
      createChallenge: 'Créer',
      table: {
        name: 'Nom',
        teams: 'Équipes',
        leader: 'Leader',
        endDate: 'Fin',
      },
      statusFilter: 'Status',
    },
    individual: {
      title: 'Challenges individuels',
      shortTitle: 'Individuels',
      subtitle: "Retrouvez l'ensemble des challenges assignés à vos membres.",
      createChallenge: 'Créer',
      table: {
        name: 'Nom',
        teams: 'Équipes',
        leader: 'Leader',
        endDate: 'Fin',
      },
    },
    form: {
      create: "Création d'un challenge",
      edit: 'Édition de challenge',
      name: 'Nom du challenge',
      namePlaceholder: 'Exemple : SalesForce',
      type: {
        label: 'Type',
        byTeam: 'La meilleure équipe',
        byTeamSubtitle: "La récompense sera remise à l'équipe ayant le plus haut score.",
        byUser: 'Le meilleur membre',
        byUserSubtitle: "La récompense sera remise à l'utilisateur avec le plus haut score.",
      },
      teamsSubtitle: 'Sélectionnez la ou les équipe(s) concerné(es) par ce challenge.',
      teamsExplained:
        "Ne sélectionner qu'une équipe pour un challenge par équipe, ou plusieurs pour un challenge inter-équipes.",
      minimum: 'Seuils minimum',
      minimumSubtitle: 'Définissez les seuils à atteindre pour pouvoir participer à ce challenge.',
      activity: 'Activité',
      activitySubtitle:
        'Les participants doivent répondre à un minimum de questions pour pouvoir remporter le challenge.',
      questions: ['{{}} question', '{{}} questions'],
      score: 'Score',
      scoreSubtitle:
        'Les participants doivent obtenir un score minimum pour pouvoir participer à ce challenge.',
      duration: 'Durée',
      durationSubtitle: 'Choisissez une date de début et de fin pour ce challenge.',
      reward: 'Récompense',
      rewardSubtitle: "Choisissez une récompense pour la personne ou l'équipe remportant ce challenge.",
      rewardPlaceholder: 'Exemple : iPhone 14 Pro',
    },
  },
  menu: {
    home: 'Accueil',
    programs: 'Programmes',
    statistics: 'Statistiques',
    team: 'Équipes',
    challenges: 'Challenges',
    settings: 'Paramètres',
    profile: 'Mon profil',
    training: 'Programmes',
    adminMode: 'Mode Administrateur',
    disconnect: 'Se déconnecter',
    feedback: 'Envoyer un feedback',
  },
  settings: {
    title: 'Paramètres',
    users: {
      title: 'Utilisateurs',
      subtitle: 'Gérez les permissions des utilisateurs de vos équipes.',
      admins: 'Administrateurs',
      adminsDesc:
        'Les administrateurs peuvent créer des programmes, des challenges et ont accès à des statistiques détaillées sur les résultats des équipes.',
      users: 'Utilisateurs standards',
      usersDesc:
        'Les utilisateurs peuvent participer aux programmes, suggérer des questions et ont accès à des statistiques détaillées sur leurs résultats seulement.',
      table: {
        name: 'Nom/Prénom',
        createdAt: "Date d'ajout",
        lastConnection: 'Dernière activité',
        connexion: 'Connexion',
        integration: 'Intégration',
      },
      enable: 'Active',
      disable: 'Inactive',
      deleteModal: {
        title: 'Supprimer l\'utilisateur "{{}}"',
        subtitle: 'Êtes-vous sûr(e) de vouloir supprimer ce collaborateur ? Cette action est irréversible.',
      },
      successEdit: 'Le collaborateur {{}} a bien été modifié',
      deleteAdminTooltip:
        'Pour supprimer un administrateur, transformez-le d’abord en utilisateur standard. Vous pourrez ensuite procéder à la suppression',
    },
    continuousSession: {
      title: 'Session continue',
      subtitle: 'Canaux de communication',
      description: 'Choisissez par quel(s) moyen(s) vous souhaitez communiquer avec vos collaborateurs.',
      integrations: {
        title: 'Intégrations',
        subtitle: 'Partagez directement les quizz dans vos canaux.',
        slack: 'Slack',
        teams: 'Teams',
      },
      webApp: {
        title: 'Web app',
        subtitle: 'Partagez directement les quizz dans vos canaux.',
      },
    },
  },
  profile: {
    title: 'Compte',
    profile: {
      title: 'Votre compte',
      shortTitle: 'Profil',
      subtitle: 'Modifiez votre photo de profil et vos informations.',
      name: 'Nom',
      firstName: 'Prénom',
      email: 'Adresse email',
      profilePicture: 'Photo de profil',
      downloadPicture: 'Cliquez pour télécharger ou faites glisser et déposez',
      company: 'Entreprise',
      team: 'Équipe',
      roles: 'Rôles',
      form: {
        success: 'Vos informations ont bien été modifiées',
      },
    },
    password: {
      title: 'Mot de passe',
      subtitle: 'Modifier votre mot de passe.',
      newPassword: 'Nouveau mot de passe',
      newPasswordRules: `<p>Votre mot de passe doit contenir:</p>
      <ul>
        <li>Au moins 8 caractères</li>
        <li>
          Au moins 3 des éléments suivants:
          <ul>
            <li>Lettres minuscules (a-z)</li>
            <li>Lettres majuscules (A-Z)</li>
            <li>Nombre (0-9)</li>
            <li>caractères spéciaux (par exemple !@#$%^&*)</li>
          </ul>
        </li>
      </ul>`,
      confirmNewPassword: 'Confirmer le nouveau mot de passe',
      update: 'Mettre à jour',
    },
  },
  errors: {
    BadParameters: {
      title: 'Bad parameters sent',
    },
    ApiOff: {
      title: 'Server unreachable',
      message: 'The server is unreachable. Please, check your internet connection or retry in a moment.',
    },
    Unauthorized: {
      title: 'Unauthorized',
      message:
        "Vous n'êtes pas reconnu par l'API, veuillez contacter un administrateur. Il s'agit probablement d'une erreur technique",
    },
    Forbidden: {
      title: 'Forbidden',
      message: "Vous n'avez pas accès !",
    },
    Notfound: {
      title: 'Item not found',
      message: "We can't find what you are looking for.",
    },
    UserNotFound: {
      title: 'User not found',
      message: 'User is not allowed to connect here. Please, contact an administrator.',
    },
    ServerError: {
      title: 'Server Error',
      message: 'The server encountered an error. Please contact the technical service.',
    },
    Conflict: {
      title: 'Conflict on Data',
    },
    OverLoad: {
      title: 'Too many requests',
      message: 'The server encountered an error. Please contact the technical service.',
    },
    ClientError: {
      title: 'Client Error',
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
      message: 'The server took too long to respond. Please, retry in a moment.',
    },
    form: {
      title: 'Form Error',
    },
    msg: {
      tooBig: {
        title: 'Size limit exceeded!',
        message: "This file is too big (> 20 Mo) and won't be uploaded: ",
      },
      tooManyFiles: {
        title: 'File limit exceeded!',
        message: 'You have reached the max. number of files for this ressource: ',
      },
    },
    NotFound404: {
      title: "Désolé, nous n'avons pas trouvé cette page.",
      subtitle:
        "Cela peut être dû à une erreur de saisie de l'adresse URL, à un lien rompu ou à une suppression de la page. Nous vous invitons à vérifier l'URL ou à retourner à la page d'accueil pour trouver ce que vous cherchez. ",
      return: "Revenir à l'accueil",
    },
  },
  test: 'test',
  userHome: {
    title: 'Bonjour ',
    subtitle: "Retrouvez une vue d'ensemble sur votre training.",
    programsRun: {
      title: 'Vos programmes en cours',
      subtitle: 'Retrouvez les programmes qui vous sont assignés.',
      continueSession: 'Session continue',
      continueSessionSubtitle:
        'Entraînez vous chaque jour à votre rythme sur des questions issues de vos différents programmes en cours.',
      continueSessionCounts: [
        "Personne ne s'est entrainé aujourd'hui",
        "s'est entrainé aujourd'hui",
        "se sont entrainés aujourd'hui",
      ],
    },
    statistics: {
      title: 'Vos statistiques',
      subtitle: 'Découvrez un aperçu de votre performance.',
      averageScore: {
        title: 'Score moyen',
        tooltip: 'Score moyen de vos questions répondues',
      },
      finishedPrograms: {
        title: 'Programmes terminés',
        tooltip: 'Nombre de programmes sur terminés le nombre de programmes assignés',
      },
      responseCount: {
        title: 'Nombre de réponses',
        tooltip: 'Nombre total de réponses',
      },
      progression: {
        title: 'Progression',
        you: 'Vous',
        yourTeam: 'Votre équipe',
        noData: 'Aucune donnée à afficher',
        noDataSubtitle: "Vous n'avez pas encore de données à afficher.",
      },
    },
    teams: {
      title: 'Votre équipe',
      subtitle: 'Découvrez votre classement et les challenges en cours.',
      leaderboard: {
        title: 'Leaderboard',
        name: 'Nom',
        score: 'Score',
      },
      challenges: {
        title: 'Challenges en cours',
        name: 'Nom',
        leader: 'Leader',
        position: 'Position',
        end: 'Fin',
      },
    },
  },
  training: {
    title: 'Programmes',
    subtitle: "Retrouvez l'ensemble de vos programmes",
    tabs: {
      onGoing: 'En cours',
      done: 'Terminés',
      showAll: 'Tout voir',
    },
    onGoing: {
      title: 'Continuez votre entraînement',
      subtitle: "Retrouvez l'ensemble de vos programmes en cours",
      filters: {
        showAll: 'Tout voir',
        started: 'Commencés',
        new: 'Nouveaux',
      },
      noData: 'Aucun programme en cours',
      noDataSubtitle: "Votre équipe n'a été assignée à aucun programme pour le moment",
    },
    continuingTraining: {
      title: 'Training continu',
      subtitle: 'Retrouvez les programmes qui vous ont été assignés',
      panels: {
        score: 'Score moyen',
        scoreTooltip: 'Score moyen de vos  questions répondues',
        frequency: 'Régularité',
        frequencyTooltip: '% de questions répondues sur le nombre de question envoyées',
        streak: 'Série en cours',
        currentStreakPlaceholder: 'C’est le moment de tester vos connaissances',
        longestStreakPlaceholder: 'Prêt(e) à relever le défi ? Lancez une session !',
        streakTooltip: "Nombre de jours consécutifs d'utilisation de l'application",
        bestStreak: 'Meilleure série',
        bestStreakTooltip: "Meilleure série de jours consécutifs d'utilisation de l'application",
      },
    },
    donePrograms: {
      title: 'Améliorez votre score',
      subtitle: 'Retrouvez les programmes qui vous ont été assignés',
      title2: 'Tous vos programmes terminés',
      subtitle2: "Tentez de faire mieux sur des programmes que vous n'avez pas réussi.",
      subtitle3: 'Retrouvez les programmes que vous avez terminé',
      backButton: 'Retourner à vos programmes',
      filters: {
        showAll: 'Tout voir',
        good: 'Validés',
        notGood: 'Non  validés',
      },
      noData: 'Aucun programme terminé',
      noDataSubtitle: "Terminez votre premier programme pour pouvoir tenter d'améliorer votre score.",
      noResult: 'Aucun résultat correspondant',
      noResultSubtitle:
        'Votre recherche n’a donné aucun résultat, essayez une autre formulation ou d’autres filtres.',
    },
    showAll: {
      title: 'Tous vos programmes',
      subtitle: "Retrouvez l'ensemble des programmes qui vous ont été assignés",
    },
    quizz: {
      secondsRemaining: 'secondes restantes',
      questionCounter: 'Question {{}} sur {{}}',
      selectOneAnswer: 'Sélectionnez la bonne réponse',
      selectAllAnswers: 'Sélectionnez toutes les bonnes réponses',
      submit: 'Valider',
      saveAndQuit: 'Enregistrer et quitter',
      dontknow: 'Je ne sais pas',

      canva: {
        goodAnswer: 'Bonne réponse !',
        badAnswer: 'Mauvaise réponse !',
        tooBad: 'Dommage !',
        goodResultSubtitle: "Il s'agissait bien de",
        badResultSubtitle: "Il s'agissait de",
        explanation: 'Explication',
        noExplanation: "Pas d'explication",
        reference: 'Référence',
        noReference: 'Pas de référence',
        continue: 'Continuer',
      },
      endModal: {
        title: 'Programme terminé !',
        subtitle: 'Félicitations, vous avez répondu à toutes les questions du programme "{{}}"',
        score: 'Votre score est de ',
        backButton: 'Retour à vos programmes',
        submitQuestion: 'Suggérer une question',
      },
    },
  },
};
