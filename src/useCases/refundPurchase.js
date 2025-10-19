const { Bill } = require('@/domains/bill');
const { User } = require('@/domains/user');

const { resourcesRepository } = require('@/repositories/resources');
const { billsRepository } = require('@/repositories/bills');
const { usersRepository } = require('@/repositories/users');

const { purchaseService } = require('@/services/purchase');

/**
 * @param {string} billCandidateId
 */
module.exports.executeRefund = async (billCandidateId) => {
  try {
    const billCandidate = await billsRepository.findById(billCandidateId);

    if (!billCandidate) {
      throw new Error(`Bill not found.`);
    }

    const bill = new Bill(billCandidate);

    const resourceIds = bill.getItemsIds();

    const customerCandidate = await usersRepository.findById(bill.customerId);

    if (!customerCandidate) {
      throw new Error('Customer not found.');
    }

    const customer = new User(customerCandidate);

    const resourcesMap = resourcesRepository.toMapped(
      await resourcesRepository.findByIds(resourceIds)
    );

    if (resourceIds.length !== resourcesMap.size) {
      const missedIds = resourceIds.filter((rId) => !resourcesMap.has(rId));

      throw new Error(
        `Some resources are not available: [${missedIds.join(', ')}]`
      );
    }

    const { updatedCustomer, updatedResources } = purchaseService.refundByBill(
      bill,
      customer,
      resourcesMap
    );

    // TODO: wrap with transaction
    const [user] = await Promise.all([
      usersRepository.save(updatedCustomer).catch((err) => {
        throw new Error(`Can't update customer state.`, { cause: err });
      }),
      // Bulk operation: Save
      Promise.all(
        updatedResources.map((updRes) => resourcesRepository.save(updRes))
      ).catch((err) => {
        throw new Error(`Can't update resource state.`, { cause: err });
      }),
    ]);

    return {
      refundedBill: await billsRepository.delete(bill._id),
      user,
    };
  } catch (err) {
    if (err.cause) {
      // Log nested error
      console.error(err.cause);
    }

    throw new Error(
      `Purchase can't be processed due an error: "${err.message}"`,
      { cause: err }
    );
  }
};
