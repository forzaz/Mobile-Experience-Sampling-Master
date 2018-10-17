setwd("D:\\PhD\\Projects\\ESM 092018\\Data")
df_user <- read.csv("Users.csv", sep=";", header=TRUE, stringsAsFactors = FALSE)
df_question <- read.csv("Questions.csv", sep=";", header=TRUE, stringsAsFactors = FALSE)
df_response <- read.csv("Responses.csv", sep=";", header=TRUE, stringsAsFactors = FALSE)
df_answer <- read.csv("Answers.csv", sep=";", header=TRUE, stringsAsFactors = FALSE)
df_notif <- read.csv("Notifications.csv", sep=";", header=TRUE, stringsAsFactors = FALSE)
names(df_user)[1] <- "Uid"
names(df_question)[1] <- "Qid"
names(df_response)[1] <- "Rid"
names(df_answer)[1] <- "Qid"
names(df_notif)[1] <- "Uid"

n_day <- max(df_notif$Did)
n_session <- max(df_notif$Sid)
df <- data.frame(Uid=rep(NA, nrow(df_user)*n_day*n_session))
vars <- c(names(df_user[2:ncol(df_user)]), names(df_notif)[2:ncol(df_notif)], df_question$Qname, names(df_response)[2:ncol(df_response)])
for (var in vars) {
  df[[var]] <- rep(NA, nrow(df))
}

for (i in 1:nrow(df_user)) {
  for (var in names(df_user))
  df[[var]][((i-1)*n_day*n_session+1):(i*n_day*n_session)] <- df_user[[var]][i]
}

for (i in unique(df_notif$Uid)) {
  for (var in names(df_notif[2:ncol(df_notif)])) {
    if (i %in% unique(df$Uid)) {
      n <- length(df_notif[[var]][which(df_notif$Uid == i)])
      df[[var]][which(df$Uid == i)] <- df_notif[[var]][which(df_notif$Uid == i)][(n-(n_day*n_session)+1):n]
    }
  }
}

df$notifs <- as.integer(as.POSIXct(df$Date), tz="CEST")
df_response$StartTime <- as.integer(as.POSIXct(df_response$StartDate), tz="CEST")
df_response$EndTime <- as.integer(as.POSIXct(df_response$EndDate), tz="CEST")

for (i in 1:nrow(df)) {
  print(i)
  Uid <- df$Uid[i]
  notif <- df$notifs[i]
  data <- df_response[which(df_response$Uid == Uid),]
  if (nrow(data) > 0 && is.na(notif) == FALSE) {
    Rid <- 0
    for (j in 1:nrow(data)) {
      if (data$StartTime[j] >= notif && data$StartTime[j] <= (notif + 60*60)) {
        Rid <- data$Rid[j]
        df$StartDate[i] <- data$StartDate[j]
        df$EndDate[i] <- data$EndDate[j]
        break
      }
    }
    if (Rid != 0) {
      answers <- df_answer[which(df_answer$Rid == Rid),]
      for (k in df_question$Qname) {
        Qid <- df_question$Qid[which(df_question$Qname == k)]
        df[[k]][i] <- answers$Value[which(answers$Qid == Qid)]
      }
    }
  }
}

df$StartTime <- as.integer(as.POSIXct(df$StartDate), tz="CEST")
df$EndTime <- as.integer(as.POSIXct(df$EndDate), tz="CEST")
df$RT <- df$EndTime - df$StartTime
df$Email <- NULL
df$Password <- NULL
df$Tmp <- NULL
df$Token <- NULL

write.table(df, file="data_merged.csv", sep=";", dec=",", row.names = FALSE)