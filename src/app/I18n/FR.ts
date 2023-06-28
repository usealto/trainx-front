export const FR = {
  shared: {
    smiley: '👍',
    edit: 'Modifier',
    save: 'Enregistrer',
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
    noTeam: 'No teams',
    optional: '(facultatif)',
    noData: 'Aucune donnée à afficher',
    noDataSubtitle: 'Aucun résultat ne correspond à votre recherche',
    reply: 'Répondre',
    search: 'Rechercher',
    period: 'Période',
    soon: 'Bientôt',
    tag: 'tag',
    program: 'programme',
    tags: 'tags',
    programs: 'programmes',
    teams: 'équipes',
    members: 'membres',
    days: ['jour', 'jours'],
    imageBadge: {
      userFinished: ['Devenez le premier à terminer', 'a terminé', 'ont terminé'],
    },
    pagination: {
      on: 'sur',
    },
    priorities: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
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
      title: 'Bravo !',
      subtitle: 'Félicitations ! Votre compte est actif 🚀.',
      description:
        "Comme souhaité par vos collaborateurs, vous profiterez bientôt d'Alto directement dans vos outils préférés tels Slack ou Teams 💜",
      subdescription: '🙏🏻',
    },
  },
  leadHome: {
    title: 'Bonjour ',
    subtitle: "Retrouvez l'ensemble des statistiques de vos équipes.",
    comments: ['{{}} commentaire', '{{}} commentaires'],
    subtitleComment: [
      'Vos utilisateurs ont laissé {{}} nouveau commentaire.',
      'Vos utilisateurs ont laissé {{}} nouveaux commentaires.',
    ],
    question: ['{{}} question suggérée', '{{}} questions suggérées'],
    subtitleQuestion: ['Vous avez {{}} question en attente.', 'Vous avez {{}} questions en attente.'],
    statistics: {
      title: 'Statistiques',
      globalScore: 'Score global',
      globalScoreToolTip: 'Score moyen des questions répondues par vos membres',
      averageCompletion: 'Complétion moyenne',
      averageCompletionToolTip: 'Nombre de programmes réussis sur le nombre de programmes assignés',
      activeMembers: 'Membres réguliers',
      activeMembersToolTip: 'Nombre de membres ayant répondu à plus de 50% des questions envoyées',
      inactiveMembers: 'Membres irréguliers',
      inactiveMembersToolTip: 'Nombre de membres ayant répondu à moins de 50% des questions envoyées',
    },
    graph: {
      period: 'Période',
      score: 'Score (%)',
    },
    globalEvolution: {
      title: 'Évolution globale',
      score: 'Score moyen',
      chartToolTip: 'Évolution du score d’un {{}} en fonction du temps',
      tabs: {
        program: 'Programmes',
        tag: 'Tags',
        team: 'Équipe',
        member: 'Membre',
      },
      top: 'Top',
      flop: 'Flop',
      topFlopTooltip: 'Classement des {{}} en fonction du score',
    },
    ongoingPrograms: {
      title: 'Programmes en cours',
      involvement: 'Participation',
      progress: 'Avancement',
      score: 'Score',
      filters: {
        team: 'Équipe',
      },
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
    title: 'Programmes',
    subtitle: "Retrouvez l'ensemble des trainings de vos équipes.",
    programs: {
      title: 'Programmes',
      subtitle: "Retrouvez l'ensemble des programmes assignés à vos équipes",
      createProgram: 'Créer',
      involvement: 'Participation',
      involvementToolTip: 'Nombre de membres ayant commencé le programme sur le nombre de membres assignés',
      progress: 'Avancement',
      progressToolTip: 'Nombre de questions répondues par tout les membres sur le nombre total de questions',
      score: 'Score',
      scoreToolTip: 'Score moyen du programme',
      filters: {
        team: 'Équipe',
      },
    },
    questions: {
      title: 'Questions',
      subtitle: "Retrouvez l'ensemble des questions présentes dans vos programmes.",
      createQuestion: 'Créer',
      remainingCharacters: 'caractères restants',

      table: {
        question: 'Question',
        score: 'Score',
        author: 'Ajoutée par',
        tags: 'Tags',
        programs: 'Programmes',
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
      subtitle: "Retrouvez l'ensemble des tags présents dans vos programmes et questions.",
      createTag: 'Créer',
      table: {
        name: 'Nom',
        score: 'Score',
        author: 'Créé par',
        associatedPrograms: 'Programmes associés',
      },
      filters: {
        programs: 'Programmes',
      },
    },
    forms: {
      create: 'Création de programme',
      edit: 'Éditeur de programme',
      questionCount: 'Nombre de questions',
      step1: {
        title: 'Informations',
        subtitle: 'Renseignez les informations générales à propos de ce programme',
        name: 'Nom du programme',
        nameSubtitle: 'Visible par tout le monde',
        namePlaceholder: 'Onboarding',
        description: 'Description',
        descriptionSubtitle: 'Ecrivez une brève description du contenu du programme',
        descriptionPlaceholder:
          "Le programme d'onboarding vise à entraîner les nouveaux arrivants avec les notions fondamentales à connaître au sein de l'entreprise.",
        tags: 'Tags',
        tagsSubtitle: 'Les sujets abordés dans le programme',
        tagsPlaceholder: 'Rechercher dans vos tags',
        teams: 'Équipes',
        teamsSubtitle: 'Les utilisateurs qui seront assignés à ce programme',
        teamsPlaceholder: 'Rechercher dans vos équipes',
        priority: 'Priorité',
        prioritySubtitle: '',
        priorityPlaceholder: 'Choisir un niveau',
        expectation: 'Score attendu',
        expectationSubtitle: '',
      },
      step2: {
        title: 'Questions',
        subtitle: 'Renseignez les informations de ce programme',
        new: 'Nouvelle question',
        newSubtitle: 'Créer une nouvelle question qui sera automatiquement associée à ce programme.',
        newText: 'Cliquer ici pour créer une nouvelle question.',
        newText2: 'Elle sera automatiquement associée à ce programme.',
        existing: 'Questions existantes',
        existingSubtitle: 'Ajouter des questions déjà créées sur les tags associés.',
      },
      step3: {
        title: 'Partage',
        title2: 'Partager votre programme',
        subtitle: 'Retrouvez les options de partage à vos équipes.',
        summary: 'Récapitulatif',
        summarySubtitle: 'Les informations que vous avez remplies à propos de ce programme.',
      },
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
        subtitle: 'Retrouvez les performances globales de vos équipes.',
        teamFilter: 'Équipes',
        scoreEvolution: {
          title: 'Évolution du score',
          subtitle: 'Evolution du niveau de maitrise global de vos équipes par tags/programmes',
        },
        leaderboard: {
          title: 'Leaderboard',
          top: 'Top',
          flop: 'Flop',
        },
      },
      perThemePerformance: {
        title: 'Performance par thèmatiques',
        subtitle: 'Retrouvez les performances globales de vos équipes.',
        filters: {
          teams: 'Équipes',
          tags: 'Tags',
          programs: 'Programmes',
        },
        scoreEvolutionChart: {
          title: 'Évolution du score',
          subtitle: 'Evolution du niveau de maitrise des connaissances de vos équipes par tags/programmes',
        },
        performanceChart: {
          title: {
            tags: 'Performance par tag',
            programs: 'Performance par programme',
          },
          subtitle: {
            tags: 'Niveau de maitrise (des connaissances) de vos équipes par tags',
            programs: 'Niveau de maitrise (des connaissances) de vos équipes par programmes',
          },
        },
        control: {
          title: 'Maitrise par thématiques',
          subtitle: {
            tags: 'Panel des tags les mieux et moins bien maitrisés par vos équipes',
            programs: 'Panel des programmes les mieux et moins bien maitrisés par vos équipes',
          },
          top: 'Top',
          flop: 'Flop',
        },
        nav: {
          tags: 'Tags',
          programs: 'Programmes',
        },
      },
      teamsTable: {
        title: 'Équipes',
        subtitle: "Découvrez les scores moyens et axes d'amélioration par équipe.",
        columns: {
          name: 'Nom',
          global: 'Global',
          lessMasteredPrograms: 'Programmes les moins maitrîsés',
          lessMasteredTags: 'Tags les moins maitrîsés',
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
      name: 'Question',
      namePlaceholder: 'Intitulé de la question',
      goodAnswer: 'Bonne(s) réponse(s)',
      addGoodAnswer: 'Ajouter une autre bonne réponse',
      answerPlaceholder: 'Réponse',
      badAnswer: 'Mauvaise(s) réponse(s) (1 minimum)',
      addBadAnswer: 'Ajouter une autre mauvaise réponse',
      programs: 'Programmes',
      programsPlaceholder: 'Rechercher dans vos programmes',
      tags: 'Tags',
      tagsPlaceholder: 'Rechercher dans vos tags',
      explanation: 'Explication (facultatif)',
      explanationPlaceholder: 'Écrire une brève explication de la question.',
      link: 'Référence (facultatif)',
      linkPlaceholder: 'Lien vers une ressource utile',
      remainingCharacters: 'caractères restants',
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
      tagNamePlaceholder: 'Exemple: RGPD',
      programs: 'Programmes',
      programsPlaceholder: 'Rechercher dans vos programmes',
      questions: 'Questions',
      questionsPlaceholder: 'Rechercher dans vos questions',
      description: 'Description',
    },
  },
  leadTeam: {
    title: 'Équipes',
    subtitle: "Retrouvez une vue d'ensemble sur vos membres.",
    createTeam: 'Créer',
    members: {
      title: 'Vos membres',
      shortTitle: 'Membres',
      subtitle: "Retrouvez l'ensemble des membres de votre entreprise.",
      invite: 'Inviter',
      filters: {
        activity: 'Activité',
        teams: 'Équipe',
        score: 'Score',
      },
      statistics: {
        total: 'Total',
        totalTooltip: 'Nombre total de membres qui vous sont affectés',
        regularMembersTooltip: 'Nombre de membres ayant répondu à plus de 50% des questions envoyées',
        iregularMembersTooltip: 'Nombre de membres ayant répondu à moins de 50% des questions envoyées',
        active: 'Membres réguliers',
        inactive: 'Membres irréguliers',
      },
      table: {
        name: 'Nom',
        team: 'Équipe',
        averageScore: 'Score moyen',
        questionsPerMonth: 'Questions sur 30j',
        questionsPerMonthTooltip:
          'Nombre de questions répondues sur les 30 derniers jours et variation sur la dernière période',
        active: 'Actif',
        inactive: 'Inactif',
      },
      forms: {
        edition: {
          title: 'Modifier un membre',
          subtitle: 'Modifiez le rôle de vos membres et assignez leur une équipe.',
          teams: 'Équipes',
          teamsPlaceholder: 'Rechercher dans vos équipes',
          type: "Type d'utilisateur",
          standardType: 'Standard',
          adminType: 'Administrateur',
          typeSubtitle:
            'Les utilisateurs de type "Administrateur" peuvent créer des programmes, des challenges et ont accès à plus de statistiques détaillées sur les résultats de leurs équipes.',
        },
      },
    },
    teams: {
      title: 'Vos équipes',
      shortTitle: 'Équipes',
      subtitle: "Retrouvez l'ensemble des équipes de votre entreprise.",
      table: {
        name: 'Nom',
        initials: '',
        usersCount: 'Nombre de membres',
        users: ['Aucun', '{{}}', '{{}}'],
        averageScore: 'Score moyen',
        creationDate: 'Date de création',
      },
      form: {
        title: {
          create: 'Créer une équipe',
          edit: 'Modifier une équipe',
        },
        subtitle: 'Donner un nom à votre équipe et inviter vos collaborateurs',
        longName: 'Nom (version longue)',
        longNamePlaceholder: "Nom complet de l'équipe",
        longNameExemple: 'Exemple : Sales Development Representative',
        shortName: 'Nom (version abrégée)',
        shortNamePlaceholder: "Nom de l'équipe",
        shortNameExemple: 'Exemple : SDR',
        invitationEmails: 'Invitation par mail',
        invitationEmailsPlaceholder: 'Séparer les emails par une virgule',
        invitationEmailsSubtitle:
          "Vos collaborateurs recevront une invitation par mail pour s'inscrire à Alto.",
        Programs: 'Programmes',
        programsPlaceholder: 'Rechercher dans vos programmes',
        ProgramsSubtitle: 'Sélectionner les programmes auxquels cette équipe doit être assignée.',
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
    profile: 'Profil',
    training: 'Programmes',
    adminMode: 'Mode Administrateur',
  },
  settings: {
    title: 'Paramètres',
    users: {
      title: 'Utilisateurs',
      subtitle: 'Gérez les permissions des utilisateurs de vos équipes.',
      admins: 'Administrateurs',
      adminsDesc:
        'Les administrateurs peuvent créer des programmes, des challenges et ont accès à des statistiques détaillées sur les résultats des équipes.',
      users: 'Utilisateurs',
      usersDesc:
        'Les utilisateurs peuvent participer aux programmes, suggérer des questions et ont accès à des statistiques détaillées sur leurs résultats seulement.',
      table: {
        name: 'Nom',
        createdAt: "Date d'ajout",
        lastConnection: 'Dernière activité',
        connexion: 'Connexion',
      },
    },
    integrations: {
      title: 'Intégrations',
      subtitle: 'Gérez les connexions avec vos applications',
      learnMore: 'En savoir plus',
      slack: {
        title: 'Slack',
        subtitle: 'Envoyez des notifications aux canaux et créez des projets à partir de messages.',
      },
    },
  },
  profile: {
    title: 'Compte',
    profile: {
      title: 'Informations personnelles',
      shortTitle: 'Profil',
      subtitle: 'Modifiez votre photo de profil et vos informations.',
      name: 'Nom',
      firstName: 'Prénom',
      email: 'Adresse email',
      profilePicture: 'Photo de profil',
      downloadPicture: 'Cliquez pour télécharger ou faites glisser et déposez',
      company: 'Entreprise',
      team: 'Equipe',
      roles: 'Rôles',
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
    Forbiden: {
      title: 'Forbiden',
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
      title: 'Erreur 404',
      subtitle: "Désolé, nous n'avons pas trouvé cette page.",
      message:
        "Cela peut être dû à une erreur de saisie de l'adresse URL, à un lien rompu ou à une suppression de la page. Nous vous invitons à vérifier l'URL, à retourner à la page d'accueil pour trouver ce que vous cherchez.",
      return: 'Revenir à l’accueil',
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
      resetFilters: 'Réinitialiser',
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
