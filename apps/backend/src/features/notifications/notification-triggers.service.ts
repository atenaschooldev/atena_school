import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  NotificationTriggerRecord,
  CreateNotificationTriggerDto,
  UpdateNotificationTriggerDto,
  SYSTEM_EVENTS_REGISTRY,
  SystemEventDefinition,
} from '@atena/api-types';

import { SYSTEM_TRIGGERS } from '@atena/core';

@Injectable()
export class NotificationTriggersService {
  constructor(private readonly prisma: PrismaService) {}

  getSystemEventsSchema(): Record<string, SystemEventDefinition> {
    return SYSTEM_EVENTS_REGISTRY;
  }

  async findAll(): Promise<NotificationTriggerRecord[]> {
    const dbRecords = await this.prisma.notification_triggers.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
      },
    });

    if (dbRecords.length > 0) {
      return dbRecords.map((r) => this.mapToRecord(r));
    }

    // Fallback to declarative TypeScript SYSTEM_TRIGGERS
    const templates = await this.prisma.notification_templates.findMany();
    const templateMap = new Map(templates.map((t) => [t.code, t]));

    return SYSTEM_TRIGGERS.map((st) => {
      const tmpl = templateMap.get(st.template_code);
      return {
        id: st.id,
        name: st.name,
        description: st.description,
        event_key: st.event_key,
        template_id: tmpl?.id || st.template_code,
        template: tmpl
          ? {
              id: tmpl.id,
              code: tmpl.code,
              name: tmpl.name,
              description: tmpl.description,
              channel: tmpl.channel as any,
              notification_type: tmpl.notificationType as any,
              recipient_type: tmpl.recipientType as any,
              subject: tmpl.subject,
              subject_template: tmpl.subject,
              body_html: tmpl.bodyHtml,
              body_text: tmpl.bodyText,
              body_template: tmpl.bodyText,
              blocks_config: tmpl.blocksConfig as any,
              available_variables: (tmpl.availableVariables as any) || [],
              is_active: tmpl.isActive,
              created_at: tmpl.createdAt.toISOString(),
              updated_at: tmpl.updatedAt.toISOString(),
            }
          : undefined,
        channel: st.channel,
        recipient_type: st.recipient_type,
        custom_recipient: st.custom_recipient || null,
        conditions: st.conditions || null,
        timing_type: st.timing_type,
        delay_seconds: st.delay_seconds,
        is_active: st.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
  }

  async findOne(id: string): Promise<NotificationTriggerRecord> {
    const record = await this.prisma.notification_triggers.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Trigger with ID "${id}" not found`);
    }

    return this.mapToRecord(record);
  }

  async create(dto: CreateNotificationTriggerDto): Promise<NotificationTriggerRecord> {
    const created = await this.prisma.notification_triggers.create({
      data: {
        name: dto.name,
        description: dto.description,
        eventKey: dto.event_key,
        templateId: dto.template_id,
        channel: dto.channel,
        recipientType: dto.recipient_type,
        customRecipient: dto.custom_recipient,
        conditions: dto.conditions || {},
        timingType: dto.timing_type || 'immediate',
        delaySeconds: dto.delay_seconds || 0,
        isActive: dto.is_active !== undefined ? dto.is_active : true,
      },
      include: {
        template: true,
      },
    });

    return this.mapToRecord(created);
  }

  async update(id: string, dto: UpdateNotificationTriggerDto): Promise<NotificationTriggerRecord> {
    const existing = await this.prisma.notification_triggers.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Trigger with ID "${id}" not found`);
    }

    const updated = await this.prisma.notification_triggers.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        description: dto.description !== undefined ? dto.description : undefined,
        eventKey: dto.event_key !== undefined ? dto.event_key : undefined,
        templateId: dto.template_id !== undefined ? dto.template_id : undefined,
        channel: dto.channel !== undefined ? dto.channel : undefined,
        recipientType: dto.recipient_type !== undefined ? dto.recipient_type : undefined,
        customRecipient: dto.custom_recipient !== undefined ? dto.custom_recipient : undefined,
        conditions: dto.conditions !== undefined ? dto.conditions : undefined,
        timingType: dto.timing_type !== undefined ? dto.timing_type : undefined,
        delaySeconds: dto.delay_seconds !== undefined ? dto.delay_seconds : undefined,
        isActive: dto.is_active !== undefined ? dto.is_active : undefined,
      },
      include: {
        template: true,
      },
    });

    return this.mapToRecord(updated);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const existing = await this.prisma.notification_triggers.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Trigger with ID "${id}" not found`);
    }

    await this.prisma.notification_triggers.delete({ where: { id } });
    return { success: true };
  }

  async toggleActive(id: string, isActive: boolean): Promise<NotificationTriggerRecord> {
    return this.update(id, { is_active: isActive });
  }

  private mapToRecord(r: any): NotificationTriggerRecord {
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      event_key: r.eventKey,
      template_id: r.templateId,
      template: r.template
        ? {
            id: r.template.id,
            code: r.template.code,
            name: r.template.name,
            description: r.template.description,
            channel: r.template.channel,
            notification_type: r.template.notificationType,
            recipient_type: r.template.recipientType,
            subject: r.template.subject,
            subject_template: r.template.subject,
            body_html: r.template.bodyHtml,
            body_text: r.template.bodyText,
            body_template: r.template.bodyText,
            blocks_config: r.template.blocksConfig,
            available_variables: r.template.availableVariables || [],
            is_active: r.template.isActive,
            created_at: r.template.createdAt.toISOString(),
            updated_at: r.template.updatedAt.toISOString(),
          }
        : undefined,
      channel: r.channel,
      recipient_type: r.recipientType,
      custom_recipient: r.customRecipient,
      conditions: r.conditions,
      timing_type: r.timingType as any,
      delay_seconds: r.delaySeconds,
      is_active: r.isActive,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    };
  }
}
