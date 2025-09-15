import { SetMetadata } from '@nestjs/common';

export const SkipApproval = () => SetMetadata('skipApproval', true);