# Agile Water Backend

## API Design

[API Design Documentation](../docs/api-design.md)

## MongoDB

[Install MongoDB Server](https://www.mongodb.com/zh-cn/docs/manual/installation/)

## Install Dependencies

```bash
pnpm i
```

## Run

```bash
pnpm run start
```

## Lint

```bash
pnpm run lint
```

## Format

```bash
pnpm run format
```

## Setup .env

**Example**

```ini
MONGO_URI="mongodb://127.0.0.1:27017/agile-water"
JWT_SECRET="K7LVJvgtkAIr4H6mWCA5k9aWvhQOPrDtfLsoa5FcrxY428sTrAO93FMVcOesaPgI"
```

## Import Data

Download `pt_info.json`, `pt_comment.json`, `pt_location.json` data and put into the directory.

### 1. Merge Data

This step will generate `pt_merged.json` file.

```bash
pnpm run merge
```

### 2. Import Data to Database

```bash
pnpm run import
```
